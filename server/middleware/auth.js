const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

module.exports = async function(req, res, next) {
  // Token'ı al (header'dan) - hem Authorization hem de x-auth-token'ı kontrol et
  let token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ error: 'Yetkilendirme hatası: Token bulunamadı' });
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // In-memory mod için kontrol - MongoDB bağlantısı olmadığında veya FALLBACK_TO_MEMORY=true olduğunda
    if (process.env.FALLBACK_TO_MEMORY === 'true' || !global.isMongoConnected) {
      console.log('Auth middleware: In-memory mod aktif');
      
      // In-memory mod kullanılıyorsa
      const userId = decoded.userId || decoded.id;
      const username = decoded.username;
      
      // userId veya username ile kullanıcı bulmaya çalış
      if (global.inMemoryUsers) {
        // İlk olarak ID ile kontrol et
        if (userId) {
          for (const [key, user] of global.inMemoryUsers.entries()) {
            if (user._id.toString() === userId.toString()) {
              console.log('In-memory: ID ile kullanıcı bulundu');
              req.user = user;
              req.token = token;
              return next();
            }
          }
        }
        
        // Sonra username ile kontrol et
        if (username && global.inMemoryUsers.has(username)) {
          console.log('In-memory: Username ile kullanıcı bulundu');
          req.user = global.inMemoryUsers.get(username);
          req.token = token;
          return next();
        }
        
        // Kullanıcı bulunamadıysa ve email varsa
        if (decoded.email && global.inMemoryUsers.has(decoded.email)) {
          console.log('In-memory: Email ile kullanıcı bulundu');
          req.user = global.inMemoryUsers.get(decoded.email);
          req.token = token;
          return next();
        }
        
        // Kullanıcı yoksa yeni oluştur
        if (username || decoded.email) {
          console.log('In-memory: Yeni kullanıcı oluşturuluyor');
          const loginId = username || decoded.email;
          const newUser = {
            _id: userId || `user_${Date.now()}`,
            username: username || decoded.email?.split('@')[0] || 'user',
            email: decoded.email || `${username}@example.com`,
            displayName: username || decoded.email?.split('@')[0] || 'user',
            role: decoded.role || 'user',
            profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginId}`,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          
          global.inMemoryUsers.set(loginId, newUser);
          req.user = newUser;
          req.token = token;
          return next();
        }
      }
    }
    
    // MongoDB ile normal doğrulama
    try {
      // ObjectId geçerli mi kontrol et
      if (!mongoose.isValidObjectId(decoded.userId)) {
        throw new Error('Geçersiz kullanıcı ID formatı');
      }
      
      // Kullanıcıyı bul
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'Yetkilendirme hatası: Kullanıcı bulunamadı' });
      }
      
      // Kullanıcıyı request'e ekle
      req.user = user;
      req.token = token;
      
      next();
    } catch (dbError) {
      console.error('Veritabanı sorgu hatası:', dbError.message);
      
      // MongoDB hatası durumunda ve in-memory aktifse
      if (global.dbFallback || process.env.FALLBACK_TO_MEMORY === 'true') {
        console.log('Veritabanı sorgu hatası, in-memory mod kullanılıyor');
        
        // Basit kullanıcı bilgisi
        const backupUser = {
          _id: decoded.userId || `user_${Date.now()}`,
          username: decoded.username || 'guest_user',
          email: decoded.email || 'guest@example.com',
          displayName: decoded.username || 'Misafir Kullanıcı',
          role: 'user',
          status: 'active',
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        if (!global.inMemoryUsers) {
          global.inMemoryUsers = new Map();
        }
        
        // Kullanıcıyı kaydet
        global.inMemoryUsers.set(backupUser.username, backupUser);
        
        req.user = backupUser;
        req.token = token;
        
        return next();
      }
      
      // In-memory çözüm de yoksa hatayı fırlat
      throw dbError;
    }
  } catch (error) {
    console.error('Token doğrulama hatası:', error.message);
    res.status(401).json({ error: 'Yetkilendirme hatası: Geçersiz token' });
  }
}; 