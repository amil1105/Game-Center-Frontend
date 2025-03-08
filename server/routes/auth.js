// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Profil resmi için storage ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Node.js'de __dirname server/routes klasörünü temsil ediyor
    // İki seviye üst dizine çıkıp, public/img/uploads/profile-pictures klasörüne gitmeliyiz
    const uploadPath = path.join(__dirname, '../../public/img/uploads/profile-pictures');
    console.log('Upload path:', uploadPath);
    
    // Dizin yoksa oluştur
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('Created directory:', uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Dosya adını user ID + tarih + uzantı olarak kaydet
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `profile-${req.user._id}-${uniqueSuffix}${ext}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Sadece belirli dosya tiplerini kabul et
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('Sadece .jpg, .jpeg, .png ve .gif dosyaları yüklenebilir!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Kayıt ol
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Gerekli alanları kontrol et
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Tüm alanları doldurun' });
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Geçerli bir email adresi girin' });
    }

    // Email kontrolü
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Bu email adresi zaten kayıtlı' });
    }

    // Kullanıcı adı kontrolü
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    // Yeni kullanıcı oluştur - SADECE GEREKLİ ALANLAR
    user = new User({
      email,
      password,
      username,
      profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + username,
      language: 'tr',
      theme: 'dark',
      notifications: {
        email: true,
        push: true
      },
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalPoints: 0
      }
    });

    await user.save();

    // Token oluştur
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Kayıt olurken hata:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    res.status(500).json({ message: 'Kayıt olurken bir hata oluştu' });
  }
});

// Giriş yap
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre gerekli' });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }

    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }

    // Son giriş tarihini güncelle
    user.lastLogin = new Date();
    await user.save();

    // Token oluştur
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Giriş yaparken hata:', error);
    res.status(500).json({ message: 'Giriş yaparken bir hata oluştu' });
  }
});

// Kullanıcı bilgilerini getir
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgileri getirilirken hata:', error);
    res.status(500).json({ message: 'Kullanıcı bilgileri getirilirken bir hata oluştu' });
  }
});

// Kullanıcı bilgilerini güncelle
router.put('/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      'username', 'profileImage', 'language', 'theme', 'notifications'
    ];

    // Sadece izin verilen alanları güncelle
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Kullanıcıyı güncelle
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Kullanıcı bilgileri güncellenirken hata:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    res.status(500).json({ message: 'Kullanıcı bilgileri güncellenirken bir hata oluştu' });
  }
});

// Kullanıcı ayarlarını güncelleme
router.put('/settings', auth, async (req, res) => {
  try {
    const allowedUpdates = ['username', 'profileImage', 'language', 'theme', 'notifications'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Geçersiz güncelleme alanları' });
    }

    updates.forEach(update => {
      req.user[update] = req.body[update];
    });

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    console.error('Ayarlar güncellenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Profil resmi yükleme
router.post('/upload-profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Request file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'Lütfen bir resim seçin' });
    }

    // Resim URL'sini oluştur (frontend'den erişilebilir olması için)
    const relativePath = `/img/uploads/profile-pictures/${path.basename(req.file.path)}`;
    console.log('Relative path for database:', relativePath);
    
    // Kullanıcının profil resmini güncelle
    req.user.profileImage = relativePath;
    await req.user.save();
    console.log('User profile updated with new image path');

    res.json({ 
      success: true, 
      profileImage: relativePath,
      message: 'Profil resmi başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Profil resmi yüklenirken hata:', error);
    res.status(500).json({ error: 'Profil resmi yüklenirken bir hata oluştu' });
  }
});

module.exports = router;

