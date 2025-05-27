const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Lobby = require('../models/Lobby');
const User = require('../models/User');
const { isValidObjectId } = require('mongoose');
const mongoose = require('mongoose');

// Tüm lobileri getir
router.get('/', auth, async (req, res) => {
  try {
    const {
      game,
      isPrivate,
      isEventLobby,
      hasPassword,
      minPlayers,
      maxPlayers,
      search,
      sort = 'createdAt',
      order = 'desc',
      limit = 50
    } = req.query;

    // Filtreleme koşulları
    const filter = { status: { $ne: 'finished' } };

    // Oyun filtresi
    if (game) {
      filter.game = game;
    }

    // Özel/Açık lobi filtresi
    if (isPrivate !== undefined) {
      filter.isPrivate = isPrivate === 'true';
    }

    // Etkinlik lobisi filtresi
    if (isEventLobby !== undefined) {
      filter.isEventLobby = isEventLobby === 'true';
    }

    // Şifreli lobi filtresi
    if (hasPassword !== undefined) {
      filter.password = hasPassword === 'true' ? { $exists: true, $ne: '' } : { $exists: false };
    }

    // Oyuncu sayısı filtresi
    if (minPlayers !== undefined || maxPlayers !== undefined) {
      filter.players = {};
      if (minPlayers !== undefined) {
        filter.players.$size = { $gte: parseInt(minPlayers) };
      }
      if (maxPlayers !== undefined) {
        filter.players.$size = { $lte: parseInt(maxPlayers) };
      }
    }

    // Arama filtresi
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { game: { $regex: search, $options: 'i' } }
      ];
    }

    // Aktif lobileri getir
    const lobbies = await Lobby.find(filter)
      .populate('creator', '_id email username profileImage')
      .populate('players', '_id email username profileImage')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .limit(parseInt(limit));

    // Lobi sayısını getir
    const totalLobbies = await Lobby.countDocuments(filter);

    res.json({
      lobbies,
      total: totalLobbies,
      hasMore: lobbies.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Lobiler listelenirken hata:', error);
    res.status(500).json({ error: 'Lobiler listelenirken bir hata oluştu' });
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
    .populate('creator', '_id email username profileImage')
    .populate('players', '_id email username profileImage')
    .sort({ createdAt: -1 });
    
    res.json(myLobbies);
  } catch (error) {
    console.error('Kişisel lobileri getirirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Lobi detaylarını getir
router.get('/:id', auth, async (req, res) => {
  try {
    const lobby = await Lobby.findById(req.params.id)
      .populate('creator', '_id email username profileImage')
      .populate('players', '_id email username profileImage');

    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }

    res.json(lobby);
  } catch (error) {
    console.error('Lobi detayları alınırken hata:', error);
    res.status(500).json({ error: 'Lobi detayları alınırken bir hata oluştu' });
  }
});

// Lobi kodu ile lobi ara
router.get('/code/:code', auth, async (req, res) => {
  try {
    const lobby = await Lobby.findOne({ lobbyCode: req.params.code, status: { $ne: 'finished' } })
      .populate('creator', '_id email username profileImage')
      .populate('players', '_id email username profileImage');

    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }

    res.json(lobby);
  } catch (error) {
    console.error('Lobi kodu ile arama hatası:', error);
    res.status(500).json({ error: 'Lobi aranırken bir hata oluştu' });
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

    const { 
      name, 
      game, 
      maxPlayers, 
      isPrivate, 
      password,
      isEventLobby,
      eventDetails,
      manualNumberDrawPermission
    } = req.body;
    
    console.log('Lobi oluşturma isteği:', req.body);
    
    // Varsayılan maks oyuncu sayısı oyun tipine göre belirlenir
    const defaultMaxPlayers = {
      'tombala': 6,
      'bingo': 6,
      'default': 4
    };
    
    const resolvedMaxPlayers = maxPlayers || defaultMaxPlayers[game] || defaultMaxPlayers.default;
    
    // Yeni lobi oluşturma
    const lobby = new Lobby({
      name,
      game,
      creator: req.user._id,
      players: [req.user._id], // Creator otomatik olarak oyuncu listesine eklenir
      maxPlayers: resolvedMaxPlayers,
      isPrivate,
      password: isPrivate ? password : undefined,
      isEventLobby: !!isEventLobby,
      manualNumberDrawPermission: manualNumberDrawPermission || 'host-only',
      eventDetails: isEventLobby ? {
        title: eventDetails?.title || name,
        description: eventDetails?.description || '',
        startDate: eventDetails?.startDate ? new Date(eventDetails.startDate) : undefined,
        endDate: eventDetails?.endDate ? new Date(eventDetails.endDate) : undefined
      } : undefined
    });

    await lobby.save();
    
    const populatedLobby = await Lobby.findById(lobby._id)
      .populate('creator', '_id email username profileImage')
      .populate('players', '_id email username profileImage');
      
    res.status(201).json(populatedLobby);
  } catch (error) {
    console.error('Lobi oluşturulurken hata:', error);
    // Daha detaylı hata bilgisi
    console.error('Hata detayları:', JSON.stringify(error, null, 2));
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validasyon hatası', details: error.message });
    }
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Lobiye katılma - yeni endpoint
router.post('/join', auth, async (req, res) => {
  try {
    const { lobbyCode, playerId, playerName, playerAvatar } = req.body;
    
    console.log('Lobiye katılma isteği alındı:', { lobbyCode, playerId });
    
    if (!lobbyCode) {
      return res.status(400).json({ error: 'Lobi kodu gereklidir', success: false });
    }
    
    const lobby = await Lobby.findOne({ lobbyCode });
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı', success: false });
    }
    
    if (lobby.status !== 'waiting') {
      return res.status(400).json({ error: 'Bu lobiye artık katılamazsınız', success: false });
    }
    
    if (lobby.players.length >= lobby.maxPlayers) {
      return res.status(400).json({ error: 'Lobi dolu', success: false });
    }
    
    // Kullanıcı ID'sini al
    const userId = playerId || req.user._id;
    
    // Oyuncu zaten lobide mi kontrol et - ObjectId düzgün karşılaştırma için
    const isAlreadyInLobby = lobby.players.some(id => 
      id.toString() === userId.toString()
    );
    
    if (!isAlreadyInLobby) {
      console.log(`Oyuncu lobiye ekleniyor: ${userId}`);
      lobby.players.push(userId);
      
      // PlayersDetail alanına da ekleme yapalım
      if (lobby.playersDetail) {
        // Oyuncu detaylı bilgisi zaten var mı kontrol et - ObjectId düzgün karşılaştırma için
        const playerDetailExists = lobby.playersDetail.some(p => 
          p.user && p.user.toString() === userId.toString()
        );
        
        if (!playerDetailExists) {
          lobby.playersDetail.push({
            user: userId,
            name: playerName || req.user.username,
            isReady: false,
            isBot: false
          });
        }
      } else {
        // playersDetail alanı yoksa oluştur
        lobby.playersDetail = [{
          user: userId,
          name: playerName || req.user.username,
          isReady: false,
          isBot: false
        }];
      }
      
      await lobby.save();
      console.log('Oyuncu lobiye başarıyla eklendi');
    } else {
      console.log(`Oyuncu zaten lobide: ${userId}`);
    }
    
    // Güncel lobi bilgilerini döndür
    const updatedLobby = await Lobby.findOne({ lobbyCode })
      .populate('creator', '_id email username profileImage')
      .populate('players', '_id email username profileImage');
      
    // Socket.io ile diğer kullanıcılara bildir
    if (req.app.get('io') && !isAlreadyInLobby) {
      req.app.get('io').to(lobbyCode).emit('playerJoined', { 
        userId,
        username: playerName || req.user.username,
        lobbyCode
      });
    }
      
    res.json({
      success: true,
      message: isAlreadyInLobby ? 'Zaten lobidesiniz' : 'Lobiye başarıyla katıldınız',
      lobby: updatedLobby
    });
  } catch (error) {
    console.error('Lobiye katılma hatası:', error);
    res.status(500).json({ 
      error: 'Lobiye katılırken bir hata oluştu', 
      details: error.message,
      success: false 
    });
  }
});

// Oyuncunun hazır durumunu güncelleme
router.post('/player-ready', auth, async (req, res) => {
  try {
    const { lobbyId, isReady } = req.body;
    
    console.log('Hazır durumu güncelleme isteği:', req.body);
    
    if (!lobbyId) {
      console.error('Lobi ID eksik:', req.body);
      return res.status(400).json({ 
        message: 'Lobi ID eksik',
        success: false 
      });
    }
    
    // Kullanıcı ID'sini doğru bir şekilde al
    const userId = req.user._id.toString();
    
    console.log('Kullanıcı ID:', userId);
    console.log('Ready durumu:', isReady);
    
    let lobby;
    try {
      // ObjectId doğrulama - geçersiz ID biçimi için hata yakalamak amacıyla try/catch içinde
      if (!mongoose.Types.ObjectId.isValid(lobbyId)) {
        return res.status(400).json({
          message: 'Geçersiz Lobi ID formatı',
          success: false
        });
      }
      
      lobby = await Lobby.findById(lobbyId);
    } catch (err) {
      console.error('Lobi arama hatası:', err);
      return res.status(400).json({
        message: 'Lobi bulunurken hata oluştu',
        success: false
      });
    }
    
    if (!lobby) {
      console.error(`Lobi bulunamadı: ${lobbyId}`);
      return res.status(404).json({
        message: 'Lobi bulunamadı',
        success: false
      });
    }

    // Kullanıcının lobide olup olmadığını kontrol et
    const isPlayerInLobby = lobby.players.some(id => id.toString() === userId);
    
    if (!isPlayerInLobby) {
      console.error(`Kullanıcı lobide değil: ${userId}`);
      return res.status(403).json({
        message: 'Bu lobide oyuncu değilsiniz',
        success: false
      });
    }

    // Önce playersDetail dizisinin var olduğunu kontrol et
    if (!lobby.playersDetail || !Array.isArray(lobby.playersDetail)) {
      console.log('PlayersDetail dizisi mevcut değil, oluşturuluyor');
      lobby.playersDetail = [];
    }

    // Oyuncunun detaylarını bul ve güncelle
    const playerDetailIndex = lobby.playersDetail.findIndex(
      player => player.user && player.user.toString() === userId
    );
    
    if (playerDetailIndex === -1) {
      // Oyuncu detayı yoksa yeni ekle
      console.log(`Oyuncu detayı bulunamadı, yeni ekleniyor: ${userId}`);
      lobby.playersDetail.push({
        user: userId,
        name: req.user.username || 'Oyuncu',
        isReady: isReady,
        isBot: false,
        joinedAt: new Date()
      });
    } else {
      // Mevcut oyuncu detayını güncelle
      console.log(`Oyuncu detayı güncelleniyor - Önceki durum: ${lobby.playersDetail[playerDetailIndex].isReady}, Yeni durum: ${isReady}`);
      lobby.playersDetail[playerDetailIndex].isReady = isReady;
    }
    
    // Doğrudan MongoDB güncelleme işlemi kullanarak daha güvenli bir şekilde güncelle
    const updateResult = await Lobby.updateOne(
      { 
        _id: lobbyId, 
        "playersDetail.user": new mongoose.Types.ObjectId(userId)
      },
      { 
        $set: { "playersDetail.$.isReady": isReady } 
      }
    );
    
    console.log('MongoDB güncelleme sonucu:', updateResult);
    
    if (updateResult.modifiedCount === 0 && playerDetailIndex === -1) {
      // Eğer oyuncu detayı yoksa, push işlemi yap
      await Lobby.updateOne(
        { _id: lobbyId },
        { 
          $push: { 
            playersDetail: {
              user: new mongoose.Types.ObjectId(userId),
              name: req.user.username || 'Oyuncu',
              isReady: isReady,
              isBot: false,
              joinedAt: new Date()
            } 
          } 
        }
      );
      console.log('Yeni oyuncu detayı eklendi');
    }
    
    console.log(`Hazır durumu güncellendi - Oyuncu: ${userId}, Durum: ${isReady}`);

    // Socket.io ile diğer oyunculara bildir
    if (req.app.get('io')) {
      req.app.get('io').to(lobbyId).emit('playerStatusUpdate', {
        userId,
        isReady,
        lobbyId,
        updateTime: new Date().toISOString()
      });
      
      // Ayrıca doğrudan bu kullanıcıya kendi durumunu bildir
      const userSocketId = req.app.get('socketMap') ? req.app.get('socketMap')[userId] : null;
      if (userSocketId) {
        req.app.get('io').to(userSocketId).emit('myStatusUpdate', {
          isReady,
          updateTime: new Date().toISOString()
        });
      }
    }

    // Güncellenmiş lobiyi döndür - oyuncuları da populate ederek
    const updatedLobby = await Lobby.findById(lobbyId)
      .populate('creator', '_id email username profileImage')
      .populate('players', '_id email username profileImage');

    res.json({ 
      success: true,
      message: 'Hazır durumu güncellendi',
      playerId: userId,
      isReady: isReady,
      lobby: updatedLobby
    });
  } catch (error) {
    console.error('Hazır durumu güncellenirken hata:', error);
    res.status(500).json({ 
      message: 'Sunucu hatası',
      error: error.message,
      success: false
    });
  }
});

// Bot ekleme
router.post('/add-bot', auth, async (req, res) => {
  try {
    const { lobbyId, lobbyCode } = req.body;
    
    console.log('Bot ekleme isteği:', req.body);
    
    let lobby;
    
    // Lobi ID veya lobi kodu ile sorgu yap
    if (lobbyId) {
      lobby = await Lobby.findById(lobbyId);
    } else if (lobbyCode) {
      lobby = await Lobby.findOne({ lobbyCode });
    } else {
      console.error('Lobi bilgisi eksik:', req.body);
      return res.status(400).json({ 
        message: 'Lobi ID veya kod eksik',
        success: false
      });
    }
    
    if (!lobby) {
      console.error(`Lobi bulunamadı: ${lobbyId || lobbyCode}`);
      return res.status(404).json({ 
        message: 'Lobi bulunamadı',
        success: false
      });
    }
    
    // Kullanıcı ID'sini al
    const userId = req.user.id || req.user._id;

    // Lobiye katılım kontrolü
    const isUserInLobby = lobby.players.some(id => id.toString() === userId.toString());
    if (!isUserInLobby) {
      console.error(`Kullanıcı lobide değil: ${userId}`);
      return res.status(403).json({ 
        message: 'Bu işlem için lobide olmanız gerekiyor',
        success: false
      });
    }

    // Bot olmayan oyuncuların sayısını hesapla
    const realPlayers = lobby.playersDetail ? lobby.playersDetail.filter(p => !p.isBot).length : 1; // En az 1 gerçek oyuncu var
    
    // Bot sayısı kontrolü
    const botCount = lobby.playersDetail ? lobby.playersDetail.filter(p => p.isBot).length : 0;
    
    // Eklenebilecek maksimum bot sayısı, lobinin dolabileceği kadar olmalı
    const maxBots = lobby.maxPlayers - realPlayers;
    console.log(`Gerçek oyuncu sayısı: ${realPlayers}, Bot sayısı: ${botCount}, Maksimum eklenebilecek bot: ${maxBots}`);
    
    if (botCount >= maxBots) {
      console.error(`Maksimum bot sayısına ulaşıldı: ${botCount}/${maxBots}`);
      return res.status(400).json({ 
        message: 'Maksimum bot sayısına ulaşıldı, tüm kullanıcı slotları dolu olacak',
        success: false
      });
    }
    
    // Lobide yer var mı kontrol et
    if (lobby.players.length >= lobby.maxPlayers) {
      console.error('Lobi dolu');
      return res.status(400).json({
        message: 'Lobi dolu, bot eklenemiyor',
        success: false
      });
    }

    // Yeni bot oluştur
    const botNumber = botCount + 1;
    const botId = new mongoose.Types.ObjectId(); // Bot için benzersiz ID
    
    // Botu players dizisine ekle
    lobby.players.push(botId);
    
    // Bot kartlarını oluştur
    const createBotCards = (count = 1) => {
      try {
        // Server.js içindeki generateTombalaCards fonksiyonunu kullan
        if (typeof req.app.get('generateTombalaCards') === 'function') {
          return req.app.get('generateTombalaCards')(count);
        }
        
        // Eğer fonksiyon yoksa, basit bir kart oluştur
        const cards = [];
        for (let c = 0; c < count; c++) {
          const cardMatrix = Array(3).fill().map(() => Array(9).fill(null));
          
          // Her satır için 5 rastgele sayı ekle
          for (let row = 0; row < 3; row++) {
            const usedPositions = new Set();
            const usedNumbers = new Set();
            
            // Her satıra 5 sayı ekle
            for (let i = 0; i < 5; i++) {
              let col;
              do {
                col = Math.floor(Math.random() * 9);
              } while (usedPositions.has(col));
              usedPositions.add(col);
              
              const min = col * 10 + 1;
              const max = col * 10 + 10;
              let num;
              do {
                num = Math.floor(Math.random() * (max - min + 1)) + min;
              } while (usedNumbers.has(num));
              usedNumbers.add(num);
              
              cardMatrix[row][col] = num;
            }
          }
          cards.push(cardMatrix);
        }
        return cards;
      } catch (error) {
        console.error('Bot kartları oluşturulurken hata:', error);
        return [];
      }
    };
    
    const botPlayer = {
      user: botId,
      name: `Bot ${botNumber}`,
      isBot: true,
      isReady: true, // Botlar otomatik hazır
      cards: createBotCards(1) // Her bot için bir tane kart oluştur
    };
    
    console.log(`Bot ${botPlayer.name} için kartlar oluşturuldu:`, botPlayer.cards);

    // Bot oyuncusunu playersDetail dizisine ekle
    if (lobby.playersDetail && Array.isArray(lobby.playersDetail)) {
      lobby.playersDetail.push(botPlayer);
    } else {
      lobby.playersDetail = [botPlayer];
    }
    
    await lobby.save();
    console.log(`Bot başarıyla eklendi: ${botPlayer.name}`);

    // Socket.io ile diğer oyunculara bildir
    if (req.app.get('io')) {
      req.app.get('io').to(lobby._id.toString()).emit('botAdded', {
        bot: botPlayer,
        lobbyId: lobby._id
      });
    }

    res.json({ 
      success: true, 
      message: 'Bot başarıyla eklendi',
      bot: botPlayer,
      lobby 
    });
  } catch (error) {
    console.error('Bot eklenirken hata:', error);
    res.status(500).json({ 
      message: 'Sunucu hatası',
      error: error.message,
      success: false
    });
  }
});

// Lobiden ayrıl (lobi id ile)
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const lobby = await Lobby.findById(req.params.id);
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }
    
    // Kullanıcı ID'sini al
    const userId = req.user.id || req.user._id;
    
    // Kullanıcı lobinin yaratıcısı mı kontrol et
    if (lobby.creator.toString() === userId.toString()) {
      // Lobi sahibi ayrılırsa, lobi silinir
      await Lobby.findByIdAndDelete(req.params.id);
      
      // Socket.io ile diğer kullanıcılara bildir
      if (req.app.get('io')) {
        req.app.get('io').to(req.params.id).emit('lobbyDeleted', {
          lobbyId: req.params.id,
          message: 'Lobi yaratıcısı ayrıldığı için lobi silindi'
        });
      }
      
      return res.json({ 
        success: true,
        message: 'Lobi silindi', 
        wasCreator: true 
      });
    }
    
    // Kullanıcı oyuncu listesinden çıkarılır
    lobby.players = lobby.players.filter(playerId => 
      playerId.toString() !== userId.toString()
    );
    
    // Oyuncu detaylarından da çıkarılır
    if (lobby.playersDetail && lobby.playersDetail.length > 0) {
      lobby.playersDetail = lobby.playersDetail.filter(player => 
        !player.user || player.user.toString() !== userId.toString()
      );
    }
    
    await lobby.save();
    
    // Socket.io ile diğer kullanıcılara bildir
    if (req.app.get('io')) {
      req.app.get('io').to(req.params.id).emit('playerLeft', {
        playerId: userId,
        lobbyId: req.params.id
      });
    }
    
    const updatedLobby = await Lobby.findById(req.params.id)
      .populate('creator', '_id email username profileImage')
      .populate('players', '_id email username profileImage');
      
    res.json({ 
      success: true, 
      message: 'Lobiden başarıyla ayrıldınız',
      lobby: updatedLobby 
    });
  } catch (error) {
    console.error('Lobiden ayrılırken hata:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası', 
      success: false 
    });
  }
});

// Lobi koduna göre lobiden ayrılma
router.post('/leave-by-code', auth, async (req, res) => {
  try {
    const { lobbyCode } = req.body;
    
    console.log('Lobiden ayrılma isteği alındı:', { lobbyCode });
    
    if (!lobbyCode) {
      return res.status(400).json({ 
        error: 'Lobi kodu gereklidir', 
        success: false 
      });
    }
    
    const lobby = await Lobby.findOne({ lobbyCode });
    
    if (!lobby) {
      return res.status(404).json({ 
        error: 'Lobi bulunamadı', 
        success: false 
      });
    }
    
    // Kullanıcı ID'sini al
    const userId = req.user.id || req.user._id;
    
    // Kullanıcı lobide mi kontrol et
    const isInLobby = lobby.players.some(id => id.toString() === userId.toString());
    
    if (!isInLobby) {
      return res.status(400).json({ 
        error: 'Bu lobiye zaten üye değilsiniz', 
        success: false 
      });
    }
    
    // Kullanıcı lobinin yaratıcısı mı kontrol et
    if (lobby.creator.toString() === userId.toString()) {
      // Lobi sahibi ayrılırsa, lobi silinir
      await Lobby.findByIdAndDelete(lobby._id);
      
      // Socket.io ile diğer kullanıcılara bildir
      if (req.app.get('io')) {
        req.app.get('io').to(lobbyCode).emit('lobbyDeleted', {
          lobbyId: lobby._id,
          lobbyCode,
          message: 'Lobi yaratıcısı ayrıldığı için lobi silindi'
        });
      }
      
      return res.json({ 
        success: true,
        message: 'Lobi silindi',
        wasCreator: true
      });
    }
    
    // Kullanıcı oyuncu listesinden çıkarılır
    lobby.players = lobby.players.filter(playerId => 
      playerId.toString() !== userId.toString()
    );
    
    // Oyuncu detaylarından da çıkarılır
    if (lobby.playersDetail && lobby.playersDetail.length > 0) {
      lobby.playersDetail = lobby.playersDetail.filter(player => 
        !player.user || player.user.toString() !== userId.toString()
      );
    }
    
    await lobby.save();
    
    // Socket.io ile diğer kullanıcılara bildir
    if (req.app.get('io')) {
      req.app.get('io').to(lobbyCode).emit('playerLeft', {
        playerId: userId,
        lobbyId: lobby._id.toString(),
        lobbyCode
      });
    }
    
    // Socket.io ile kullanıcı direk ayrılabilsin
    if (req.app.get('io')) {
      // Kullanıcıya özel leaveLobby olayını tetikle - kendi clientını temizlemesi için
      const io = req.app.get('io');
      const sockets = await io.in(lobbyCode).fetchSockets();
      
      for (const socket of sockets) {
        const clientData = socket.handshake.auth;
        
        // Kullanıcı ID'sine göre socket'i bul
        if (clientData && clientData.userId && clientData.userId.toString() === userId.toString()) {
          console.log(`Kullanıcı socketini lobiden çıkar: ${clientData.userId}`);
          socket.leave(lobbyCode);
        }
      }
    }
    
    const updatedLobby = await Lobby.findOne({ lobbyCode })
      .populate('creator', '_id email username profileImage')
      .populate('players', '_id email username profileImage');
      
    res.json({ 
      success: true, 
      message: 'Lobiden başarıyla ayrıldınız',
      lobby: updatedLobby
    });
  } catch (error) {
    console.error('Lobiden ayrılırken hata:', error);
    res.status(500).json({ 
      error: 'Sunucu hatası',
      details: error.message,
      success: false
    });
  }
});

// Lobi durumunu güncelleme (kimlik doğrulama olmadan da erişilebilir)
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['waiting', 'playing', 'finished'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Geçersiz durum değeri' 
      });
    }
    
    const lobbyId = req.params.id;
    let lobby;
    
    // ID veya kod ile lobi bul
    if (isValidObjectId(lobbyId)) {
      lobby = await Lobby.findById(lobbyId);
    } else {
      lobby = await Lobby.findOne({ lobbyCode: lobbyId });
    }
    
    if (!lobby) {
      return res.status(404).json({ 
        success: false,
        error: 'Lobi bulunamadı' 
      });
    }
    
    // Durum güncellemesi
    lobby.status = status;
    
    // Eğer durum 'playing' ise, başlangıç zamanını ayarla
    if (status === 'playing' && !lobby.startedAt) {
      lobby.startedAt = new Date();
    }
    
    // Eğer durum 'finished' ise, bitiş zamanını ayarla
    if (status === 'finished' && !lobby.endedAt) {
      lobby.endedAt = new Date();
    }
    
    await lobby.save();
    
    // Socket.io ile bildirim gönder
    const io = req.app.get('io');
    if (io) {
      io.to(lobby._id.toString()).emit('lobby_status_updated', {
        lobbyId: lobby._id,
        lobbyCode: lobby.lobbyCode,
        status: lobby.status,
        updatedAt: new Date()
      });
      
      // Ayrıca lobi kodu ile de bildirim gönder
      if (lobby.lobbyCode) {
        io.to(lobby.lobbyCode).emit('lobby_status_updated', {
          lobbyId: lobby._id,
          lobbyCode: lobby.lobbyCode,
          status: lobby.status,
          updatedAt: new Date()
        });
      }
    }
    
    res.json({
      success: true,
      lobbyId: lobby._id,
      lobbyCode: lobby.lobbyCode,
      status: lobby.status,
      updatedAt: lobby.updatedAt
    });
  } catch (error) {
    console.error('Lobi durumu güncellenirken hata:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lobi durumu güncellenirken bir hata oluştu' 
    });
  }
});

// ID ile erişilemiyorsa lobi kodunu kullan
router.patch('/code/:code', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['waiting', 'playing', 'finished'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Geçersiz durum değeri' 
      });
    }
    
    const lobbyCode = req.params.code;
    const lobby = await Lobby.findOne({ lobbyCode });
    
    if (!lobby) {
      return res.status(404).json({ 
        success: false,
        error: 'Lobi bulunamadı' 
      });
    }
    
    // Durum güncellemesi
    lobby.status = status;
    
    // Eğer durum 'playing' ise, başlangıç zamanını ayarla
    if (status === 'playing' && !lobby.startedAt) {
      lobby.startedAt = new Date();
    }
    
    // Eğer durum 'finished' ise, bitiş zamanını ayarla
    if (status === 'finished' && !lobby.endedAt) {
      lobby.endedAt = new Date();
    }
    
    await lobby.save();
    
    // Socket.io ile bildirim gönder
    const io = req.app.get('io');
    if (io) {
      io.to(lobby._id.toString()).emit('lobby_status_updated', {
        lobbyId: lobby._id,
        lobbyCode: lobby.lobbyCode,
        status: lobby.status,
        updatedAt: new Date()
      });
      
      // Ayrıca lobi kodu ile de bildirim gönder
      io.to(lobby.lobbyCode).emit('lobby_status_updated', {
        lobbyId: lobby._id,
        lobbyCode: lobby.lobbyCode,
        status: lobby.status,
        updatedAt: new Date()
      });
    }
    
    res.json({
      success: true,
      lobbyId: lobby._id,
      lobbyCode: lobby.lobbyCode,
      status: lobby.status,
      updatedAt: lobby.updatedAt
    });
  } catch (error) {
    console.error('Lobi durumu güncellenirken hata:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lobi durumu güncellenirken bir hata oluştu' 
    });
  }
});

// Lobi güncelleme
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      maxPlayers, 
      isPrivate, 
      password, 
      isEventLobby, 
      eventDetails,
      manualNumberDrawPermission,
      gameSpeed,
      enableMusic,
      enableVoiceChat,
      roundTime,
      pointsToWin
    } = req.body;
    
    console.log('Lobi güncelleme isteği:', req.body);
    
    const lobby = await Lobby.findById(id);
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }
    
    // Sadece lobi sahibi düzenleyebilir
    if (lobby.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Bu lobiyi düzenleme yetkiniz yok' });
    }
    
    // Güncellenecek alanları kontrol et
    if (name) lobby.name = name;
    if (maxPlayers) lobby.maxPlayers = maxPlayers;
    if (isPrivate !== undefined) lobby.isPrivate = isPrivate;
    if (password !== undefined) lobby.password = password;
    if (isEventLobby !== undefined) lobby.isEventLobby = isEventLobby;
    if (manualNumberDrawPermission) lobby.manualNumberDrawPermission = manualNumberDrawPermission;
    if (gameSpeed) lobby.gameSpeed = gameSpeed;
    if (enableMusic !== undefined) lobby.enableMusic = enableMusic;
    if (enableVoiceChat !== undefined) lobby.enableVoiceChat = enableVoiceChat;
    if (roundTime) lobby.roundTime = roundTime;
    if (pointsToWin) lobby.pointsToWin = pointsToWin;
    
    // Etkinlik detaylarını güncelle
    if (eventDetails && isEventLobby) {
      lobby.eventDetails = {
        title: eventDetails.title || name,
        description: eventDetails.description || '',
        startDate: eventDetails.startDate ? new Date(eventDetails.startDate) : undefined,
        endDate: eventDetails.endDate ? new Date(eventDetails.endDate) : undefined
      };
    } else if (!isEventLobby) {
      // Etkinlik lobisi değilse eventDetails'i temizle
      lobby.eventDetails = undefined;
    }
    
    await lobby.save();
    
    const updatedLobby = await Lobby.findById(id)
      .populate('creator', '_id email username profileImage')
      .populate('players', '_id email username profileImage');
      
    res.json(updatedLobby);
  } catch (error) {
    console.error('Lobi güncelleme hatası:', error);
    console.error('Hata detayları:', error);
    res.status(500).json({ error: 'Lobi güncellenirken bir hata oluştu' });
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

// Lobi kodu ile lobi bulma
router.get('/code/:lobbyCode', auth, async (req, res) => {
  try {
    const { lobbyCode } = req.params;
    
    if (!lobbyCode) {
      return res.status(400).json({ error: 'Lobi kodu gereklidir' });
    }

    const lobby = await Lobby.findOne({ 
      lobbyCode, 
      status: { $ne: 'finished' } 
    })
    .populate('creator', '_id email username profileImage')
    .populate('players', '_id email username profileImage');
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı veya süresi dolmuş' });
    }
    
    res.json(lobby);
  } catch (error) {
    console.error('Lobi kodu ile arama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Lobi koduna göre katılma
router.post('/join-by-code', auth, async (req, res) => {
  try {
    const { lobbyCode, password } = req.body;
    
    if (!lobbyCode) {
      return res.status(400).json({ error: 'Lobi kodu gereklidir' });
    }
    
    const lobby = await Lobby.findOne({ lobbyCode, status: { $ne: 'finished' } });
    
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
    if (lobby.players.some(playerId => playerId.toString() === req.user._id.toString())) {
      return res.status(400).json({ error: 'Zaten bu lobidensiniz' });
    }
    
    // Gizli lobi ise şifre kontrolü yap
    if (lobby.isPrivate) {
      if (!password) {
        return res.status(401).json({ error: 'Bu lobi için şifre gereklidir' });
      }
      
      if (password !== lobby.password) {
        return res.status(401).json({ error: 'Geçersiz şifre' });
      }
    }
    
    lobby.players.push(req.user._id);
    await lobby.save();
    
    const updatedLobby = await Lobby.findById(lobby._id)
      .populate('creator', '_id email username profileImage')
      .populate('players', '_id email username profileImage');
      
    res.json(updatedLobby);
  } catch (error) {
    console.error('Lobi koduna göre katılma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Benzersiz lobi kodu oluşturmak için yardımcı fonksiyon
function generateLobbyCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Lobiye mesaj gönderme
router.post('/:lobbyCode/messages', auth, async (req, res) => {
  try {
    const { lobbyCode } = req.params;
    const { message, senderId } = req.body;
    
    console.log('Mesaj gönderme isteği alındı:', { lobbyCode, message, senderId });
    
    if (!lobbyCode) {
      return res.status(400).json({ error: 'Lobi kodu gereklidir', success: false });
    }
    
    if (!message) {
      return res.status(400).json({ error: 'Mesaj içeriği gereklidir', success: false });
    }
    
    const lobby = await Lobby.findOne({ lobbyCode });
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı', success: false });
    }
    
    // Kullanıcı ID'sini al - gönderici farklı belirtilmişse onu kullan
    const userId = senderId || req.user._id;
    
    // Oyuncu lobide mi kontrol et
    // Sistem mesajları için bu kontrolü atla (sistem mesajlarını herhangi bir kullanıcı gönderebilir)
    if (userId !== 'system') {
      const playerInLobby = lobby.players.some(id => id.toString() === userId.toString());
      
      if (!playerInLobby) {
        return res.status(400).json({ error: 'Sadece lobideki oyuncular mesaj gönderebilir', success: false });
      }
    }
    
    // Yeni mesaj oluştur
    const newMessage = {
      sender: userId === 'system' ? null : userId,
      text: message,
      isSystem: userId === 'system',
      createdAt: new Date()
    };
    
    // Mesajı lobby.messages dizisine ekle
    if (!lobby.messages) {
      lobby.messages = [];
    }
    
    lobby.messages.push(newMessage);
    
    // Mesaj sayısını kontrol et - çok fazla mesaj birikirse eski mesajları temizle
    if (lobby.messages.length > 100) {
      // En eski mesajları sil - sadece son 50 mesajı tut
      lobby.messages = lobby.messages.slice(-50);
    }
    
    await lobby.save();
    
    console.log('Mesaj başarıyla kaydedildi');
    
    res.json({
      success: true,
      message: 'Mesaj başarıyla gönderildi',
      newMessage
    });
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error);
    res.status(500).json({ 
      error: 'Mesaj gönderilirken bir hata oluştu', 
      details: error.message,
      success: false 
    });
  }
});

// Lobi mesajlarını getir
router.get('/:lobbyCode/messages', auth, async (req, res) => {
  try {
    const { lobbyCode } = req.params;
    
    if (!lobbyCode) {
      return res.status(400).json({ error: 'Lobi kodu gereklidir' });
    }
    
    const lobby = await Lobby.findOne({ lobbyCode })
      .populate('messages.sender', '_id username profileImage');
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }
    
    // Mesajları tarih sırasına göre sırala
    const messages = (lobby.messages || []).sort((a, b) => a.createdAt - b.createdAt);
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Mesajlar alınırken hata:', error);
    res.status(500).json({ error: 'Mesajlar alınırken bir hata oluştu' });
  }
});

// Lobi durumunu güncelle
router.post('/update-status', auth, async (req, res) => {
  try {
    const { lobbyId, lobbyCode, status } = req.body;
    
    if (!lobbyId && !lobbyCode) {
      return res.status(400).json({ error: 'Lobi ID veya kodu gereklidir' });
    }
    
    if (!status) {
      return res.status(400).json({ error: 'Durum bilgisi gereklidir' });
    }
    
    // Lobi ID veya kodu ile lobi ara
    let lobby;
    if (lobbyId && isValidObjectId(lobbyId)) {
      lobby = await Lobby.findById(lobbyId);
    } else if (lobbyCode) {
      lobby = await Lobby.findOne({ lobbyCode });
    }
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }
    
    // Yetkilendirme: Sadece lobi yaratıcısı veya oyuncularından biri statüyü değiştirebilir
    const isAuthorized = req.user._id.equals(lobby.creator) || 
      lobby.players.some(playerId => playerId.equals(req.user._id));
      
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    
    // Durumu güncelle
    lobby.status = status;
    await lobby.save();
    
    // Socket.io ile diğer kullanıcılara bildir
    const io = req.app.get('io');
    if (io) {
      io.to(lobby._id.toString()).emit('lobbyStatusUpdate', {
        lobbyId: lobby._id,
        status: lobby.status
      });
    }
    
    res.json({ success: true, message: 'Lobi durumu güncellendi', status: lobby.status });
  } catch (error) {
    console.error('Lobi durumu güncellenirken hata:', error);
    res.status(500).json({ error: 'Lobi durumu güncellenirken bir hata oluştu' });
  }
});

// Lobideki oyuncuları getir
router.get('/:id/players', async (req, res) => {
  try {
    const lobbyId = req.params.id;
    
    // ID formatı kontrolü
    let lobby;
    if (isValidObjectId(lobbyId)) {
      // MongoDB ObjectID formatında ise direkt ID ile ara
      lobby = await Lobby.findById(lobbyId)
        .populate('players', '_id username email profileImage')
        .populate('playersDetail');
    } else {
      // Lobi kodu formatındaysa lobbyCode olarak ara
      lobby = await Lobby.findOne({ lobbyCode: lobbyId })
        .populate('players', '_id username email profileImage')
        .populate('playersDetail');
    }

    if (!lobby) {
      return res.status(404).json({ 
        success: false,
        error: 'Lobi bulunamadı' 
      });
    }

    // Oyuncuları formatla
    const formattedPlayers = lobby.players.map(player => {
      const playerDetail = lobby.playersDetail?.find(
        pd => pd.user && pd.user.toString() === player._id.toString()
      );
      
      return {
        id: player._id,
        name: player.username,
        email: player.email,
        profileImage: player.profileImage,
        isBot: false,
        status: playerDetail?.status || 'waiting',
        isReady: playerDetail?.isReady || false,
        cards: playerDetail?.cards || []
      };
    });

    // Varsa bot oyuncuları da ekle
    const bots = lobby.playersDetail?.filter(pd => pd.isBot) || [];
    const formattedBots = bots.map(bot => ({
      id: bot._id,
      name: bot.name || 'Bot',
      isBot: true,
      status: bot.status || 'ready',
      isReady: true,
      cards: bot.cards || []
    }));

    // Tüm oyuncuları birleştir
    const allPlayers = [...formattedPlayers, ...formattedBots];

    res.json({
      success: true,
      players: allPlayers,
      lobbyId: lobby._id,
      lobbyCode: lobby.lobbyCode,
      gameStatus: lobby.status
    });
  } catch (error) {
    console.error('Lobi oyuncuları alınırken hata:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lobi oyuncuları alınırken bir hata oluştu' 
    });
  }
});

// Lobi sahibinin diğer oyuncuları atması için endpoint
router.post('/kick-player', auth, async (req, res) => {
  try {
    const { lobbyId, lobbyCode, playerId, isBot } = req.body;
    
    console.log('Oyuncu atma isteği alındı:', { lobbyId, lobbyCode, playerId, isBot });
    
    if (!lobbyId && !lobbyCode) {
      return res.status(400).json({ 
        message: 'Lobi ID veya lobi kodu gereklidir',
        success: false
      });
    }
    
    if (!playerId) {
      return res.status(400).json({ 
        message: 'Atılacak oyuncu ID gereklidir',
        success: false
      });
    }
    
    // Lobi ID veya koduna göre lobi bilgilerini getir
    const lobby = lobbyId 
      ? await Lobby.findById(lobbyId)
      : await Lobby.findOne({ lobbyCode });
    
    if (!lobby) {
      return res.status(404).json({ 
        message: 'Lobi bulunamadı',
        success: false
      });
    }
    
    // Kullanıcı ID'sini al (işlemi yapan kullanıcı)
    const userId = req.user.id || req.user._id;
    
    // Kullanıcının lobi sahibi olup olmadığını kontrol et
    const isHost = lobby.creator.toString() === userId.toString();
    
    if (!isHost) {
      return res.status(403).json({ 
        message: 'Bu işlemi sadece lobi sahibi yapabilir',
        success: false
      });
    }
    
    // Kendini atamaz
    if (playerId === userId.toString()) {
      return res.status(400).json({ 
        message: 'Kendinizi lobiden atamazsınız',
        success: false
      });
    }
    
    // Atılacak kullanıcı lobide mi kontrol et
    const isPlayerInLobby = lobby.players.some(id => 
      id.toString() === playerId.toString()
    );
    
    if (!isPlayerInLobby && !isBot) {
      return res.status(400).json({ 
        message: 'Atılmak istenen oyuncu lobide bulunamadı',
        success: false
      });
    }
    
    // Oyuncunun adını burada alalım - atılan mesajda kullanmak için
    let playerName = "Bir oyuncu";
    const playerDetail = lobby.playersDetail?.find(player => {
      // Her iki durumu da kontrol et: doğrudan ID veya user nesnesi
      const pid = (player.user?._id || player.user || player.id || player._id || '').toString();
      return pid === playerId.toString();
    });
    
    if (playerDetail) {
      playerName = playerDetail.name || playerDetail.user?.username || "Bir oyuncu";
    }
    
    // Oyuncuyu oyuncu listesinden çıkar
    lobby.players = lobby.players.filter(id => 
      id.toString() !== playerId.toString()
    );
    
    // Oyuncu detay listesinden de çıkarılır
    if (lobby.playersDetail && lobby.playersDetail.length > 0) {
      lobby.playersDetail = lobby.playersDetail.filter(player => {
        // Eğer bu bir bot ise ve ID eşleşiyorsa çıkar
        if (player.isBot && player._id && player._id.toString() === playerId.toString()) {
          return false;
        }
        
        // Normal bir oyuncu ise user ID'sine göre kontrol et
        if (player.user) {
          const playerUserId = (typeof player.user === 'object') 
            ? (player.user._id || player.user.id || '').toString()
            : player.user.toString();
          
          return playerUserId !== playerId.toString();
        }
        
        return true;
      });
    }
    
    await lobby.save();
    
    // Socket.io ile diğer kullanıcılara bildir
    if (req.app.get('io')) {
      const io = req.app.get('io');
      // Tüm lobiye oyuncunun atıldığını bildir
      io.to(lobby.lobbyCode || lobby._id.toString()).emit('playerKicked', {
        playerId: playerId,
        playerName: playerName,
        kickedBy: userId,
        lobbyId: lobby._id.toString(),
        lobbyCode: lobby.lobbyCode
      });
    }
    
    res.json({ 
      success: true, 
      message: `${playerName} lobiden atıldı.`,
      lobby
    });
  } catch (error) {
    console.error('Oyuncu atma işlemi sırasında hata:', error);
    res.status(500).json({ 
      message: 'Sunucu hatası',
      error: error.message,
      success: false
    });
  }
});

module.exports = router; 