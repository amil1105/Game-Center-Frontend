const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Lobby = require('../models/Lobby');
const User = require('../models/User');

// Tüm lobileri getir
router.get('/', auth, async (req, res) => {
  try {
    const lobbies = await Lobby.find({ 
      status: { $ne: 'finished' } 
    })
    .populate('creator', 'email username profileImage')
    .populate('players', 'email username profileImage')
    .sort({ createdAt: -1 });
    
    res.json(lobbies);
  } catch (error) {
    console.error('Lobileri getirirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcının kendi lobilerini getir
router.get('/my', auth, async (req, res) => {
  try {
    const myLobbies = await Lobby.find({
      $or: [
        { creator: req.user._id },
        { players: req.user._id }
      ],
      status: { $ne: 'finished' }
    })
    .populate('creator', 'email username profileImage')
    .populate('players', 'email username profileImage')
    .sort({ createdAt: -1 });
    
    res.json(myLobbies);
  } catch (error) {
    console.error('Kişisel lobileri getirirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni lobi oluştur
router.post('/', auth, async (req, res) => {
  try {
    // Kullanıcının aktif bir lobisi var mı kontrol et
    const existingLobby = await Lobby.findOne({
      creator: req.user._id,
      status: { $ne: 'finished' }
    });

    if (existingLobby) {
      return res.status(400).json({ error: 'Zaten aktif bir lobiniz var' });
    }

    const { name, game, maxPlayers, isPrivate, password } = req.body;
    
    const lobby = new Lobby({
      name,
      game,
      creator: req.user._id,
      players: [req.user._id], // Creator otomatik olarak oyuncu listesine eklenir
      maxPlayers,
      isPrivate,
      password: isPrivate ? password : undefined,
    });

    await lobby.save();
    
    const populatedLobby = await Lobby.findById(lobby._id)
      .populate('creator', 'email username profileImage')
      .populate('players', 'email username profileImage');
      
    res.status(201).json(populatedLobby);
  } catch (error) {
    console.error('Lobi oluşturulurken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Lobiye katıl
router.post('/:id/join', auth, async (req, res) => {
  try {
    const lobby = await Lobby.findById(req.params.id);
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }
    
    if (lobby.status !== 'waiting') {
      return res.status(400).json({ error: 'Bu lobiye artık katılamazsınız' });
    }
    
    if (lobby.players.length >= lobby.maxPlayers) {
      return res.status(400).json({ error: 'Lobi dolu' });
    }
    
    // Oyuncu zaten lobide mi kontrol et
    if (lobby.players.includes(req.user._id)) {
      return res.status(400).json({ error: 'Zaten bu lobidensiniz' });
    }
    
    // Gizli lobi ise şifre kontrolü yap
    if (lobby.isPrivate) {
      const { password } = req.body;
      if (password !== lobby.password) {
        return res.status(401).json({ error: 'Geçersiz şifre' });
      }
    }
    
    lobby.players.push(req.user._id);
    await lobby.save();
    
    const updatedLobby = await Lobby.findById(req.params.id)
      .populate('creator', 'email username profileImage')
      .populate('players', 'email username profileImage');
      
    res.json(updatedLobby);
  } catch (error) {
    console.error('Lobiye katılırken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Lobiden ayrıl
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const lobby = await Lobby.findById(req.params.id);
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }
    
    // Kullanıcı lobinin yaratıcısı mı kontrol et
    if (lobby.creator.toString() === req.user._id.toString()) {
      // Lobi sahibi ayrılırsa, lobi silinir
      await Lobby.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Lobi silindi' });
    }
    
    // Kullanıcı oyuncu listesinden çıkarılır
    lobby.players = lobby.players.filter(playerId => 
      playerId.toString() !== req.user._id.toString()
    );
    
    await lobby.save();
    
    const updatedLobby = await Lobby.findById(req.params.id)
      .populate('creator', 'email username profileImage')
      .populate('players', 'email username profileImage');
      
    res.json(updatedLobby);
  } catch (error) {
    console.error('Lobiden ayrılırken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Lobinin durumunu güncelle
router.put('/:id/status', auth, async (req, res) => {
  try {
    const lobby = await Lobby.findById(req.params.id);
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }
    
    // Sadece lobi yaratıcısı durumu değiştirebilir
    if (lobby.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    
    const { status } = req.body;
    
    if (!['waiting', 'playing', 'finished'].includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }
    
    lobby.status = status;
    await lobby.save();
    
    const updatedLobby = await Lobby.findById(req.params.id)
      .populate('creator', 'email username profileImage')
      .populate('players', 'email username profileImage');
      
    res.json(updatedLobby);
  } catch (error) {
    console.error('Lobi durumu güncellenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Lobi silme
router.delete('/:id', auth, async (req, res) => {
  try {
    const lobby = await Lobby.findById(req.params.id);
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }
    
    // Sadece lobi yaratıcısı silebilir
    if (lobby.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    
    await Lobby.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lobi silindi' });
  } catch (error) {
    console.error('Lobi silinirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router; 