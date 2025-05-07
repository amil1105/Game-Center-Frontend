// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// MongoDB modellerini yükle
const Lobby = require('./models/Lobby');
const User = require('./models/User');

// Tombala yardımcı fonksiyonlarını içe aktar veya tanımla
// Bir oyuncunun kartında 15 işaretli sayı olup olmadığını kontrol et
const checkForTombalaByMarkedCount = (card, drawnNumbers) => {
  if (!card || !drawnNumbers || !Array.isArray(card) || !Array.isArray(drawnNumbers)) {
    return { isTombala: false, markedCount: 0 };
  }
  
  // Karttaki tüm sayıları düz bir diziye çevir
  const allNumbers = card.flat().filter(num => num !== null);
  
  // İşaretlenen sayıları bul
  const markedNumbers = allNumbers.filter(num => drawnNumbers.includes(num));
  
  // İşaretlenen sayı sayısı
  const markedCount = markedNumbers.length;
  
  // Tombala durumu - 15 işaretli sayı olduğunda tombala
  const isTombala = markedCount === 15;
  
  console.log(`İşaretli sayı kontrolü: ${markedCount}/15 - Tombala: ${isTombala}`);
  
  return { isTombala, markedCount };
};

// Socket.io bağlantısı - Geliştirilmiş konfigürasyon
const io = socketIo(server, {
  cors: {
    origin: '*', // Tüm domainlere izin ver - geliştirme ortamı için
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control'],
    credentials: true
  },
  allowEIO3: true, // EIO 3 protokolünü destekle (geriye dönük uyumluluk için)
  transports: ['websocket', 'polling'], // WebSocket ve polling desteği
  pingTimeout: 60000, // Ping timeout süresini artır (60 saniye) - bağlantı kesilmelerini azaltmak için
  pingInterval: 10000, // Ping aralığı (10 saniye) - daha sık ping kontrolü
  connectTimeout: 45000, // Bağlantı zaman aşımı (45 saniye)
  maxHttpBufferSize: 1e8, // 100MB - büyük veri paketleri için
  path: '/socket.io/', // Socket.io path - varsayılan
  serveClient: true, // Socket.io client dosyalarını servis et
  upgradeTimeout: 30000, // Upgrade zaman aşımı (30 saniye)
  cookie: {
    name: 'io',
    path: '/',
    httpOnly: true,
    sameSite: 'lax'
  }
});

// Log bağlantıları
io.engine.on('connection_error', (err) => {
  console.error('Socket.io bağlantı hatası:', err);
});

// Socket ile kullanıcı eşleştirmelerini takip et
const socketMap = {};

// Socket.io bağlantısını express uygulamasına ekle
app.set('io', io);
app.set('socketMap', socketMap);

// Daha gelişmiş CORS ayarları
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:3100', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// CORS hataları için önleyici middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Statik dosyaları sunmak için - yetkilendirme olmadan erişilebilir
console.log('Statik dosya dizini:', path.join(__dirname, '../public'));
app.use('/img', express.static(path.join(__dirname, '../public/img')));

// Özellikle uploads klasörünü statik olarak herkese açık yap
const uploadsPath = path.join(__dirname, '../public/img/uploads');
app.use('/img/uploads', express.static(uploadsPath));

// Tombala uygulaması statik dosyaları
const tombalaPath = path.join(__dirname, '../packages/tombala/dist');
if (fs.existsSync(tombalaPath)) {
  console.log('Tombala statik dosya dizini:', tombalaPath);
  app.use('/tombala', express.static(tombalaPath));
  
  // Tombala index.html'i direkt erişim için
  app.get('/tombala', (req, res) => {
    res.sendFile(path.join(tombalaPath, 'index.html'));
  });
  
  // Tombala alt URL'leri için (SPA router için)
  app.get('/tombala/*', (req, res) => {
    res.sendFile(path.join(tombalaPath, 'index.html'));
  });
  
  // Game alt URL'lerini de destekle (SPA router'da /game/:lobbyId şeklindeki yollar için)
  app.get('/game/*', (req, res) => {
    console.log('Game route yakalandı:', req.path);
    res.sendFile(path.join(tombalaPath, 'index.html'));
  });
} else {
  console.warn('Tombala statik dosya dizini bulunamadı:', tombalaPath);
}

// Aktif kullanıcıları ve socket bağlantılarını takip etmek için
const connectedUsers = new Map();
const lobbyUsers = new Map();

// WebSocket (Socket.io) bağlantı işlemleri
io.on('connection', (socket) => {
  console.log(`Yeni bir socket bağlantısı: ${socket.id}`);
  
  // Bağlantı parametrelerini al ve loglama
  const { lobbyId, playerId, playerName } = socket.handshake.query;
  console.log(`Bağlantı parametreleri: lobbyId=${lobbyId}, playerId=${playerId}, playerName=${playerName || 'Belirtilmemiş'}`);

  // Ping-pong ile bağlantı kontrolü
  socket.on('ping', (data, callback) => {
    console.log(`Ping alındı: ${socket.id}`);
    if (typeof callback === 'function') {
      callback({ status: 'pong', timestamp: Date.now() });
    }
  });
  
  // Socket eventleri
  socket.on('draw_number', async (data) => {
    try {
      console.log(`Sayı çekme isteği alındı: ${JSON.stringify(data)}`);
      const { lobbyId } = data;
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        console.error('Sayı çekme isteğinde Lobi ID eksik');
        return;
      }
      
      // Lobi bilgilerini al
      const lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? mongoose.Types.ObjectId(lobbyId) : null }
        ]
      });
      
      if (!lobby) {
        socket.emit('error', { message: 'Lobi bulunamadı' });
        console.error(`Lobi bulunamadı: ${lobbyId}`);
        return;
      }
      
      // Oyun başlamış mı kontrol et
      if (lobby.status !== 'playing') {
        socket.emit('error', { message: 'Oyun başlamadı, sayı çekilemez' });
        console.error(`Oyun başlamadı, sayı çekilemez. Mevcut durum: ${lobby.status}`);
        return;
      }
      
      // drawnNumbers dizisinin durumunu kontrol et ve logla
      console.log(`Sayı çekme öncesi - Lobi: ${lobbyId}, Mevcut çekilen sayılar:`, 
        Array.isArray(lobby.drawnNumbers) ? `${lobby.drawnNumbers.length} sayı çekilmiş: [${lobby.drawnNumbers.join(', ')}]` : 'dizi değil');
    
      // Eğer drawnNumbers tanımlı değilse, boş dizi olarak başlat
      if (!lobby.drawnNumbers || !Array.isArray(lobby.drawnNumbers)) {
        console.log('drawnNumbers dizisi tanımlı değil veya dizi değil, yeni dizi oluşturuluyor');
        lobby.drawnNumbers = [];
      }
      
      // drawnNumbers dizisini kontrol et, eğer nesneyse diziye çevir
      if (typeof lobby.drawnNumbers === 'object' && !Array.isArray(lobby.drawnNumbers)) {
        console.log('drawnNumbers bir nesne olarak saklanmış, diziye çevriliyor');
        const tempArray = [];
        for (const key in lobby.drawnNumbers) {
          if (Object.prototype.hasOwnProperty.call(lobby.drawnNumbers, key)) {
            tempArray.push(parseInt(lobby.drawnNumbers[key]));
    }
        }
        lobby.drawnNumbers = tempArray;
    }
    
      // Önceki çekilen sayıların sayısını logla
      console.log(`Çekilen sayı sayısı (çekim öncesi): ${lobby.drawnNumbers.length}/90`);
      
      // Yeni sayı çek
      const nextNumber = getRandomNumber(lobby.drawnNumbers);
      
      if (nextNumber === null) {
        console.log('Çekilecek yeni sayı kalmadı!');
        socket.emit('error', { message: 'Çekilecek sayı kalmadı' });
        return;
      }
      
      // Sayıyı ekle
      lobby.drawnNumbers.push(nextNumber);
      lobby.currentNumber = nextNumber;
        
      // drawnNumbers dizisini kontrol et ve logla
      console.log(`Sayı eklendikten sonra - drawnNumbers: [${lobby.drawnNumbers.join(', ')}]`);
      console.log(`Toplam çekilen sayı adedi: ${lobby.drawnNumbers.length}/90`);
          
      // Mongo için güncellemeyi işaretle
      lobby.markModified('drawnNumbers');
          
      // Veritabanına kaydet
      try {
        await lobby.save();
        console.log(`Lobby başarıyla kaydedildi. Güncel çekilen sayı adedi: ${lobby.drawnNumbers.length}/90`);
              
        // Tüm oyunculara yeni sayıyı bildir - kaydettikten sonra bildir
        io.to(lobbyId).emit('number_drawn', {
          number: nextNumber,
          drawnNumbers: lobby.drawnNumbers,
          timestamp: Date.now(),
          totalDrawn: lobby.drawnNumbers.length
        });
        
        console.log(`Yeni sayı çekildi: ${nextNumber} - Toplam: ${lobby.drawnNumbers.length}/90`);
      } catch (saveError) {
        console.error('Lobi kaydedilirken hata:', saveError);
        socket.emit('error', { message: 'Lobi kaydedilirken hata oluştu' });
        return;
      }
      
      // Tüm sayılar çekildiyse durumu güncelle
      if (lobby.drawnNumbers.length >= 90) {
        lobby.status = 'finished';
                await lobby.save();
        io.to(lobbyId).emit('game_end', { 
          message: 'Tüm sayılar çekildi, oyun bitti!',
          allNumbersDrawn: true
        });
        return;
        }
        
      // Tüm oyuncuların kartlarını kontrol et - 15 işaretli sayı kontrolü
      if (lobby.playersDetail && Array.isArray(lobby.playersDetail)) {
        for (const player of lobby.playersDetail) {
          if (player.card) {
            const tombalaCheck = checkForTombalaByMarkedCount(player.card, lobby.drawnNumbers);

            // Eğer oyuncunun kartında 15 işaretli sayı varsa, otomatik tombala!
            if (tombalaCheck.isTombala) {
              console.log(`Otomatik tombala tespit edildi! Oyuncu: ${player.name || player.id}, İşaretli: ${tombalaCheck.markedCount}/15`);
    
              // Kullanıcı adını users tablosundan al
              let realPlayerName = player.name;
              try {
                if (mongoose.Types.ObjectId.isValid(player.id)) {
                  const user = await User.findById(player.id);
                  if (user && user.username) {
                    realPlayerName = user.username;
                    console.log(`Kullanıcı adı Users tablosundan alındı: ${realPlayerName}`);
                  } else {
                    console.log(`Kullanıcı bulunamadı veya username alanı yok: ${player.id}`);
                    
                    // Kullanıcı bilgisi player.user'dan gelebilir
                    if (player.user && typeof player.user === 'object') {
                      // Zaten Mongoose tarafından populate edilmiş olabilir
                      if (player.user.username) {
                        realPlayerName = player.user.username;
                        console.log(`Kullanıcı adı player.user nesnesinden alındı: ${realPlayerName}`);
                      }
                    } else if (player.user) {
                      // Lobi içinde detaylı bilgilerine bak
                      const playerDetail = lobby.playersDetail.find(p => 
                        p.user && p.user.toString() === player.user.toString()
                      );
                      
                      if (playerDetail && playerDetail.name) {
                        realPlayerName = playerDetail.name;
                        console.log(`Oyuncu adı playersDetail'dan alındı: ${realPlayerName}`);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error('Kullanıcı bilgisi alınamadı:', error);
              }
    
              // Kazananı güncelle
              if (!lobby.winners) lobby.winners = [];
              lobby.winners.push({
                playerId: player.id,
                playerName: realPlayerName || player.name || 'Bilinmeyen Oyuncu',
                type: 'tombala',
                timestamp: new Date()
              });
              lobby.markModified('winners');
              
              // Oyunu bitir
              lobby.status = 'finished';
              lobby.finishedAt = new Date();
              await lobby.save();
              
              // Tüm oyunculara bildirimi gönder
              io.to(lobbyId).emit('game_end', {
                message: `${realPlayerName || player.name || 'Bir oyuncu'} tüm sayıları işaretledi (15/15)! Oyun bitti!`,
                winner: {
                  playerId: player.id,
                  playerName: realPlayerName || player.name || 'Bilinmeyen Oyuncu',
                  totalMarked: tombalaCheck.markedCount,
                  type: 'tombala'
                },
                tombalaCompleted: true
              });
              
              io.to(lobbyId).emit('tombala_claimed', {
                playerId: player.id,
                playerName: realPlayerName || player.name || 'Bilinmeyen Oyuncu',
                type: 'tombala',
                automatic: true,
                totalMarked: 15
              });
              
              return; // Oyunu bitir, diğer oyuncuları kontrol etme
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Sayı çekme hatası:', error);
      socket.emit('error', { message: 'Sayı çekilirken bir hata oluştu' });
    }
  });

  // Odaya katılma
  socket.on('join_lobby', async (data) => {
    try {
    const { lobbyId, playerId, playerName } = data;
      console.log(`Lobiye katılma isteği: ${lobbyId}, Oyuncu: ${playerId}, İsim: ${playerName || 'Belirtilmemiş'}`);
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        return;
      }
      
      // Gerçek kullanıcı adını Users tablosundan al
      let realPlayerName = playerName;
      try {
        if (mongoose.Types.ObjectId.isValid(playerId)) {
          const user = await User.findById(playerId);
          if (user && user.username) {
            realPlayerName = user.username;
            console.log(`Kullanıcı adı Users tablosundan alındı: ${realPlayerName}`);
          }
        }
      } catch (userError) {
        console.error('Kullanıcı bilgisi alınamadı:', userError);
      }
      
      // Lobiye katıl
    socket.join(lobbyId);
      console.log(`Oyuncu ${playerId} (${realPlayerName}) ${lobbyId} lobisine katıldı`);
      
      try {
        // Lobi bilgilerini al
        const lobby = await Lobby.findOne({ 
          $or: [
            { lobbyCode: lobbyId }, 
            { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? mongoose.Types.ObjectId(lobbyId) : null }
          ]
        }).populate({
          path: 'playersDetail.user',
          select: 'username profileImage'
        });
        
        if (lobby) {
          console.log(`Lobi bulundu: ${lobby.lobbyCode}`);
          
          // Kullanıcı bilgilerini zenginleştir
          const enrichedPlayers = lobby.playersDetail.map(player => {
            // Null kontrol
            if (!player.user) {
              return {
                id: `bot-${player._id || Math.random().toString(36).substring(2, 9)}`,
                name: player.name || 'Bot Oyuncu',
                isBot: true,
                isHost: false,
                isReady: player.isReady || false,
                profileImage: player.profileImage || null
              };
            }
            
            const userProfile = player.user;
            return {
              id: player.user.toString(),
              name: player.name || (userProfile ? userProfile.username : 'Bilinmeyen Oyuncu'),
              isBot: player.isBot || false,
              isHost: player.user.toString() === lobby.creator.toString(),
              isReady: player.isReady || false,
              profileImage: player.profileImage || (userProfile ? userProfile.profileImage : null)
            };
          });
          
          // Oyun durumunu bildir
                socket.emit('lobby_joined', {
            lobbyId: lobby.lobbyCode,
            gameStatus: lobby.status,
            drawnNumbers: lobby.drawnNumbers || [],
            currentNumber: lobby.currentNumber,
            message: `${realPlayerName || 'Oyuncu'} lobiye katıldı`,
            players: enrichedPlayers
          });
          
          // Diğer oyunculara bildir
          socket.to(lobbyId).emit('player_joined', {
            playerId,
            playerName: realPlayerName || 'Yeni Oyuncu',
            players: enrichedPlayers
          });
              } else {
          console.warn(`Lobi bulunamadı, geçici lobi oluşturuluyor: ${lobbyId}`);
          
          // Geçici lobi bilgisini oluştur
                socket.emit('lobby_joined', {
                  lobbyId,
                  gameStatus: 'waiting',
                        drawnNumbers: [],
            message: `${playerName || 'Oyuncu'} lobiye katıldı (geçici lobi)`,
            players: []
          });
        }
      } catch (lobbyError) {
        console.error('Lobi bilgileri alınırken hata:', lobbyError);
        
        // Hata durumunda da lobiye katılma bilgisi gönder
    socket.emit('lobby_joined', {
      lobbyId,
          gameStatus: 'waiting',
          drawnNumbers: [],
          message: `${playerName || 'Oyuncu'} lobiye katıldı (lobi bilgisi alınamadı)`,
          players: []
        });
      }
    } catch (error) {
      console.error('Lobiye katılma hatası:', error);
      socket.emit('error', { message: 'Lobiye katılırken bir hata oluştu' });
    }
  });
  
  // Oyun başlatma olayı
  socket.on('game_start', async (data) => {
    try {
      const { lobbyId, newGame } = data;
      console.log(`Oyun başlatma isteği: ${JSON.stringify(data)}`);
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        return;
        }
        
      // Lobi bilgilerini al
      const lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? mongoose.Types.ObjectId(lobbyId) : null }
        ]
      });
      
      if (!lobby) {
        socket.emit('error', { message: 'Lobi bulunamadı' });
        console.error(`Lobi bulunamadı: ${lobbyId}`);
        return;
      }
      
      // Oyun başlatıldı olarak güncelle
              lobby.status = 'playing';
      
      // Yeni oyun başlatılıyorsa, çekilen sayıları sıfırla
      if (newGame) {
        console.log('Yeni oyun başlatıldı, çekilen sayılar sıfırlanıyor');
              lobby.drawnNumbers = [];
              lobby.currentNumber = null;
        
        // Kazananları da sıfırla
        if (lobby.winners) {
          lobby.winners = [];
        }
      } else {
        // Yeni oyun değilse, çekilen sayıların doğru formatta olduğundan emin ol
        if (!lobby.drawnNumbers || !Array.isArray(lobby.drawnNumbers)) {
          console.log('drawnNumbers dizisi tanımlı değil veya dizi değil, yeni dizi oluşturuluyor');
      lobby.drawnNumbers = [];
    }
    
        // drawnNumbers dizisini kontrol et, eğer nesneyse diziye çevir
        if (typeof lobby.drawnNumbers === 'object' && !Array.isArray(lobby.drawnNumbers)) {
          console.log('drawnNumbers bir nesne olarak saklanmış, diziye çevriliyor');
          const tempArray = [];
          for (const key in lobby.drawnNumbers) {
            if (Object.prototype.hasOwnProperty.call(lobby.drawnNumbers, key)) {
              tempArray.push(parseInt(lobby.drawnNumbers[key]));
            }
          }
          lobby.drawnNumbers = tempArray;
        }
      }
      
      // Mongo için güncellemeyi işaretle
      lobby.markModified('drawnNumbers');
      if (lobby.winners) {
        lobby.markModified('winners');
      }
      
      // Veritabanına kaydet
      await lobby.save();
      console.log(`Lobi durumu güncellendi: ${lobby.lobbyCode}, Durum: ${lobby.status}, Çekilen Sayı Adedi: ${lobby.drawnNumbers.length}/90`);
    
    // Tüm oyunculara bildir
      io.to(lobbyId).emit('game_start', {
        gameStatus: lobby.status,
        drawnNumbers: lobby.drawnNumbers || [],
        currentNumber: lobby.currentNumber,
        message: data.message || 'Oyun başladı!',
        isNewGame: newGame || false
    });
    
      // Sistem mesajı olarak da gönder
      io.to(lobbyId).emit('system_message', {
        message: data.message || 'Oyun başladı!',
        type: 'info',
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Oyun başlatma hatası:', error);
      socket.emit('error', { message: 'Oyun başlatılırken bir hata oluştu' });
    }
  });

  // Bağlantı kesildiğinde
  socket.on('disconnect', (reason) => {
    console.log(`Socket bağlantısı kesildi (${socket.id}): ${reason}`);
  });
  
  // Tombala talep etme olayı
  socket.on('claim_tombala', async (data) => {
    try {
      const { lobbyId, playerId, playerName, totalMarked } = data;
      console.log(`Tombala talebi alındı: Lobi=${lobbyId}, Oyuncu=${playerId || playerName}`);
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        return;
      }
      
      // Lobi bilgilerini al
      const lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? mongoose.Types.ObjectId(lobbyId) : null }
        ]
      });
      
      if (!lobby) {
        socket.emit('error', { message: 'Lobi bulunamadı' });
        console.error(`Lobi bulunamadı: ${lobbyId}`);
        return;
      }
      
      // Oyun başlamış mı kontrol et
      if (lobby.status !== 'playing') {
        socket.emit('error', { message: 'Oyun başlamadı veya bitti, tombala talep edilemez' });
        console.error(`Oyun başlamadı veya bitti, tombala talep edilemez. Mevcut durum: ${lobby.status}`);
        return;
      }
      
      // Kullanıcı adını users tablosundan al
      let realPlayerName = playerName;
      try {
        if (mongoose.Types.ObjectId.isValid(playerId)) {
          const user = await User.findById(playerId);
          if (user && user.username) {
            realPlayerName = user.username;
            console.log(`Kullanıcı adı Users tablosundan alındı: ${realPlayerName}`);
          } else {
            console.log(`Kullanıcı bulunamadı veya username alanı yok: ${playerId}`);
            
            // PlayersDetail içinde bu oyuncunun adını ara
            if (lobby.playersDetail && Array.isArray(lobby.playersDetail)) {
              const playerDetail = lobby.playersDetail.find(p => 
                p.user && p.user.toString() === playerId
              );
              
              if (playerDetail && playerDetail.name) {
                realPlayerName = playerDetail.name;
                console.log(`Oyuncu adı playersDetail'dan alındı: ${realPlayerName}`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Kullanıcı bilgisi alınamadı:', error);
      }
      
      // Kazanan olarak ekle
      if (!lobby.winners) {
        lobby.winners = [];
                }
                
      const winnerInfo = {
                  playerId,
        playerName: realPlayerName || playerName || 'Bilinmeyen Oyuncu',
        type: 'tombala',
        timestamp: new Date(),
        totalMarked: totalMarked || 15
      };
                
      lobby.winners.push(winnerInfo);
      lobby.markModified('winners');
      
      // Oyunu bitir
      lobby.status = 'finished';
      lobby.finishedAt = new Date();
      
      // Veritabanına kaydet
      await lobby.save();
      console.log(`Lobi durumu güncellendi (Tombala): ${lobby.lobbyCode}, Yeni durum: ${lobby.status}`);
      
      // Tüm oyunculara bildir
        io.to(lobbyId).emit('tombala_claimed', {
          playerId,
        playerName: realPlayerName || playerName || 'Bir oyuncu',
        type: 'tombala',
        timestamp: Date.now(),
        totalMarked: totalMarked || 15
    });
        
      // Oyun sonu bildirimini gönder
        io.to(lobbyId).emit('game_end', {
        message: `${realPlayerName || playerName || 'Bir oyuncu'} TOMBALA yaptı! Oyun bitti!`,
        winner: winnerInfo,
          winType: 'tombala',
        gameStatus: 'finished',
        endReason: 'tombala_claimed'
        });
        
      // Sistem mesajı olarak da gönder
      io.to(lobbyId).emit('system_message', {
        message: `${realPlayerName || playerName || 'Bir oyuncu'} TOMBALA yaptı! Oyun bitti!`,
        type: 'success',
        timestamp: Date.now()
      });
      
        } catch (error) {
      console.error('Tombala talep hatası:', error);
      socket.emit('error', { message: 'Tombala talebi işlenirken bir hata oluştu' });
    }
  });

  // Oyun sonu olayı
  socket.on('game_end', async (data) => {
    try {
      const { lobbyId, playerId, reason, message } = data;
      console.log(`Oyun sonu isteği alındı: Lobi=${lobbyId}, Sebep=${reason}`);
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        return;
      }
      
      // Lobi bilgilerini al
      const lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? mongoose.Types.ObjectId(lobbyId) : null }
        ]
      });
    
    if (!lobby) {
      socket.emit('error', { message: 'Lobi bulunamadı' });
        console.error(`Lobi bulunamadı: ${lobbyId}`);
      return;
        }
    
      // Oyun başlamış mı kontrol et (sadece oynanan oyunlar bitirilebilir)
      if (lobby.status !== 'playing') {
        console.log(`Oyun zaten ${lobby.status} durumunda, bitirme işlemi atlanıyor`);
        return;
      }
      
      // Oyunu bitir
      lobby.status = 'finished';
      lobby.finishedAt = new Date();
      
      // Veritabanına kaydet
      await lobby.save();
      console.log(`Lobi durumu güncellendi (Oyun sonu): ${lobby.lobbyCode}, Yeni durum: ${lobby.status}`);
      
    // Tüm oyunculara bildir
    io.to(lobbyId).emit('game_end', {
        message: message || 'Oyun sona erdi!',
        reason: reason || 'manual_end',
      gameStatus: 'finished',
        timestamp: Date.now()
      });
      
      // Sistem mesajı olarak da gönder
      io.to(lobbyId).emit('system_message', {
        message: message || 'Oyun sona erdi!',
        type: 'info',
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Oyun sonu hatası:', error);
      socket.emit('error', { message: 'Oyun sonlandırılırken bir hata oluştu' });
    }
  });

  // Lobi bilgilerini güncelleme olayı
  socket.on('lobby_info', async (data) => {
    try {
      const { lobbyId } = data;
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
      return;
    }
    
      // Lobi bilgilerini al
      const lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? mongoose.Types.ObjectId(lobbyId) : null }
        ]
      }).populate({
        path: 'playersDetail.user',
        select: 'username profileImage'
      });
      
      if (lobby) {
        console.log(`Lobi bilgileri gönderiliyor: ${lobby.lobbyCode}`);
        
        // Kullanıcı bilgilerini zenginleştir
        const mappedPlayers = lobby.playersDetail.map(player => {
          // Null kontrol
          if (!player.user) {
            return {
              id: `bot-${player._id || Math.random().toString(36).substring(2, 9)}`,
              name: player.name || 'Bot Oyuncu',
              isBot: true,
              isHost: false,
              isReady: player.isReady || false,
              profileImage: player.profileImage || null
            };
          }
          
          return {
            id: player.user.toString(),
            name: player.name,
            isBot: player.isBot || false,
            isHost: player.user.toString() === lobby.creator.toString(),
            isReady: player.isReady || false,
            profileImage: player.profileImage || null
          };
        });
        
        // Lobi bilgilerini gönder
        io.to(lobbyId).emit('lobby_info', {
          lobbyId: lobby.lobbyCode,
          status: lobby.status,
          drawnNumbers: lobby.drawnNumbers || [],
          currentNumber: lobby.currentNumber,
          players: mappedPlayers
        });
      } else {
        console.warn(`Lobi bulunamadı: ${lobbyId}`);
        socket.emit('error', { message: 'Lobi bulunamadı' });
      }
    } catch (error) {
      console.error('Lobi bilgileri gönderilirken hata:', error);
      socket.emit('error', { message: 'Lobi bilgileri alınırken bir hata oluştu' });
    }
  });
});

// Web uygulaması statik dosyaları
const webDistPath = path.join(__dirname, '../packages/web/dist');
if (fs.existsSync(webDistPath)) {
  console.log('Web uygulaması statik dosya dizini:', webDistPath);
  app.use(express.static(webDistPath));
} else {
  console.warn('Web uygulaması statik dosya dizini bulunamadı:', webDistPath);
}

// Yükleme dizini kontrolü ve oluşturma
const uploadDir = path.join(__dirname, '../public/img/uploads/profile-pictures');
if (!fs.existsSync(uploadDir)) {
  console.log('Yükleme dizini oluşturuluyor:', uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Test endpoint'i ve dosya yollarını kontrol etmek için
app.get('/test', (req, res) => {
  res.json({ message: 'Server çalışıyor!' });
});

app.get('/file-test', (req, res) => {
  const files = [];
  try {
    if (fs.existsSync(uploadDir)) {
      const dirFiles = fs.readdirSync(uploadDir);
      files.push(...dirFiles.map(file => `/img/uploads/profile-pictures/${file}`));
    }
  } catch (error) {
    console.error('Dosyalar listelenirken hata:', error);
  }
  
  res.json({ 
    message: 'Dosya testi',
    uploadDir,
    exists: fs.existsSync(uploadDir),
    files
  });
});

// API Endpoint'leri için yönlendirme
// frontend'de kullanılan yapıyı karşılamak için doğrudan erişim ekleyelim
app.use('/auth', require('./routes/auth'));
app.use('/lobbies', require('./routes/lobbies')); // Doğrudan /lobbies endpoint'i
app.use('/players', require('./routes/players')); // Doğrudan /players endpoint'i

// Ayrıca /api prefixi ile de destekleyelim (geriye dönük uyumluluk için)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lobbies', require('./routes/lobbies'));
app.use('/api/protected', require('./routes/protected'));
app.use('/api/players', require('./routes/players')); // /api/players endpoint'i

// Tombala uygulaması için doğrudan erişim noktası ekleyelim - kimlik doğrulama kontrolünü atlar
app.get('/direct-tombala/:lobbyId', (req, res) => {
  const lobbyId = req.params.lobbyId;
  const { playerId, lobbyName } = req.query;
  
  console.log('Direct Tombala URL yakalandı:', req.url);
  console.log('Parametre değerleri:', { lobbyId, playerId, lobbyName });
  
  // Tombala uygulamasının index.html'ine yönlendir
  const tombalaPath = path.join(__dirname, '../packages/tombala/dist');
  
  if (fs.existsSync(tombalaPath)) {
    console.log('Tombala uygulamasının HTML sayfasına yönlendiriliyor...');
    return res.sendFile(path.join(tombalaPath, 'index.html'));
  } else {
    console.log('Tombala uygulamasının statik dosyaları bulunamadı:', tombalaPath);
    // URL parametrelerini koru ve yönlendir
    const queryParams = new URLSearchParams();
    if (lobbyId) queryParams.append('lobbyId', lobbyId);
    if (playerId) queryParams.append('playerId', playerId);
    if (lobbyName) queryParams.append('lobbyName', lobbyName);
    
    const redirectUrl = `/tombala?${queryParams.toString()}`;
    console.log('Yönlendirme yapılıyor:', redirectUrl);
    
    return res.redirect(redirectUrl);
  }
});

// React uygulaması SPA route'ları (dist klasörü yerine web package'ının build edilmiş halini servis et)
app.get('/game/tombala/:lobbyCode', (req, res) => {
  console.log('Tombala route yakalandı:', req.params.lobbyCode);
  // Ana uygulama index.html'ini gönder - client tarafında routing yapılacak
  res.sendFile(path.join(__dirname, '../packages/web/dist/index.html'));
});

// SPA client-side routing için catch-all
// Doğrudan URL'ye girilen tüm yolları destekle
app.get('/:lobbyId([A-Za-z0-9]{6,})', (req, res) => {
  console.log('Doğrudan lobi ID URL yakalandı:', req.params.lobbyId);
  // Ana uygulama index.html'ini gönder - client tarafında routing yapılacak
  res.sendFile(path.join(__dirname, '../packages/web/dist/index.html'));
});

// Game ile başlayan tüm URL'leri destekle
app.get('/game/:lobbyId([A-Za-z0-9]{1,})', (req, res) => {
  console.log('Game route yakalandı, lobbyId:', req.params.lobbyId);
  // Ana uygulama index.html'ini gönder - client tarafında routing yapılacak
  res.sendFile(path.join(__dirname, '../packages/tombala/dist/index.html'));
});

// Normal genel catch-all
app.get('*', (req, res, next) => {
  // Eğer API isteği ise işlemi devam ettir
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Eğer Socket.io isteği ise işlemi devam ettir
  if (req.path.startsWith('/socket.io/')) {
    return next();
  }
  
  // Özel /direct-tombala/ rotası için kontrol
  if (req.path.startsWith('/direct-tombala/')) {
    const parts = req.path.split('/');
    const lobbyId = parts.length > 2 ? parts[2] : '';
    
    // Tüm URL parametrelerini koru
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    
    // Tombala uygulamasına yönlendir
    const redirectPath = `/tombala/game/${lobbyId}${queryString}`;
    console.log(`Özel rota yönlendirmesi: ${req.path} -> ${redirectPath}`);
    
    return res.redirect(redirectPath);
  }
  
  // Statik dosyalar için kontrol
  const publicPath = path.join(__dirname, '../public');
  const tombalaPath = path.join(__dirname, '../packages/tombala/dist');
  
  const requestedFilePath = req.path === '/' ? '/index.html' : req.path;
  
  // Önce public klasöründe ara
  if (fs.existsSync(path.join(publicPath, requestedFilePath))) {
    return res.sendFile(path.join(publicPath, requestedFilePath));
  }
  
  // Sonra tombala klasöründe ara
  if (fs.existsSync(path.join(tombalaPath, requestedFilePath))) {
    return res.sendFile(path.join(tombalaPath, requestedFilePath));
  }
  
  // Bulunamadıysa, SPA rotası olarak ele al
  const isTombalaRoute = req.path.startsWith('/tombala') || req.path.includes('tombala');
  
  if (isTombalaRoute) {
    if (fs.existsSync(tombalaPath)) {
      return res.sendFile(path.join(tombalaPath, 'index.html'));
    }
  }
  
  // Diğer her şey için ana sayfaya yönlendir
  return res.sendFile(path.join(publicPath, 'index.html'));
});

// Tombala kartları üretme yardımcı fonksiyonu
function generateTombalaCards(cardCount = 1) {
  try {
    const cards = [];
    
    for (let c = 0; c < cardCount; c++) {
      // Her satırın rakam pozisyonları
      const numberPositions = [
        [0, 1, 2, 3, 4, 0, 1, 2, 3], // 5 rakam
        [0, 1, 0, 1, 2, 3, 4, 0, 1], // 5 rakam
        [0, 1, 2, 3, 0, 1, 2, 3, 4]  // 5 rakam
      ];
      
      // Her satırın rakam aralıkları
      const numberRanges = [
        [1, 10], [11, 20], [21, 30], [31, 40], [41, 50],
        [51, 60], [61, 70], [71, 80], [81, 90]
      ];
      
      // Kart matrisi
      const cardMatrix = Array(3).fill().map(() => Array(9).fill(null));
      
      // Her satır için
      for (let row = 0; row < 3; row++) {
        const usedNumbers = new Set();
        const positions = numberPositions[row];
        
        // Her sütun için
        for (let col = 0; col < 9; col++) {
          if (positions.includes(col)) {
            // Bu pozisyona sayı koy
            const [min, max] = numberRanges[col];
            let randomNum;
            
            do {
              randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (usedNumbers.has(randomNum));
            
            usedNumbers.add(randomNum);
            cardMatrix[row][col] = randomNum;
          }
        }
      }
      
      cards.push(cardMatrix);
    }
    
    return cards;
  } catch (error) {
    console.error('Kart üretiminde hata:', error);
    return [];
  }
}

// Rastgele sayı çekme fonksiyonu (1-90 arası, daha önce çekilmemiş)
function getRandomNumber(drawnNumbers = []) {
  const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
  const availableNumbers = allNumbers.filter(num => !drawnNumbers.includes(num));
  
  if (availableNumbers.length === 0) {
    console.log('Tüm sayılar çekildi!');
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
  return availableNumbers[randomIndex];
}

// MongoDB bağlantısını yap
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gamecenter';

// MongoDB bağlantı seçenekleri
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000, // Sunucu seçim zaman aşımını artırdım (30sn)
  socketTimeoutMS: 75000, // Soket zaman aşımını artırdım (75sn)
  connectTimeoutMS: 60000, // Bağlantı zaman aşımını artırdım (60sn)
  maxPoolSize: 100, // Bağlantı havuzu boyutu 
  minPoolSize: 5, // Minimum bağlantı sayısı
  maxIdleTimeMS: 30000, // Boşta kalma süresi
  heartbeatFrequencyMS: 10000, // Heartbeat sıklığı
  retryWrites: true,
  w: 'majority'
};

// MongoDB bağlantı ve hata yönetimi
let isMongoConnected = false;
// isMongoConnected değişkenini global olarak tanımlayalım
global.isMongoConnected = false;

const connectWithRetry = async () => {
  // Eğer FALLBACK_TO_MEMORY=true ise in-memory mod kullan
  if (process.env.FALLBACK_TO_MEMORY === 'true') {
    console.log('FALLBACK_TO_MEMORY=true ayarı nedeniyle doğrudan in-memory mod kullanılıyor');
    setupInMemoryMode();
    return;
  }
  
  console.log('MongoDB bağlantısı kurulmaya çalışılıyor...');
  console.log('Bağlantı adresi:', MONGO_URI);
  
  let retries = 5;
  
  while (retries > 0) {
    try {
      await mongoose.connect(MONGO_URI, mongooseOptions);
      console.log('MongoDB bağlantısı başarılı!');
      isMongoConnected = true;
      global.isMongoConnected = true;
      
      // MongoDB'ye başarılı bağlantı sonrası bazı indeksleri oluştur
      try {
        await createIndexes();
      } catch (indexError) {
        console.error('İndeks oluşturma hatası, uygulama yine de devam edecek:', indexError.message);
      }
      
      break;
    } catch (err) {
      console.error(`MongoDB bağlantı hatası (kalan deneme: ${retries}):`, err.message);
      retries--;
      
      if (retries === 0) {
        console.error('MongoDB bağlantısı kurulamadı, in-memory mod kullanılacak');
        setupInMemoryMode();
      } else {
        // Yeniden deneme öncesi bekle
        console.log(`${5000/1000} saniye sonra tekrar denenecek...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
};

// Önemli koleksiyonlar için indeksleri oluştur
const createIndexes = async () => {
  try {
    // Mongoose modeli hazır mı kontrol et
    if (!mongoose.models.Lobby) {
      console.log('Lobby modeli henüz yüklenmemiş, indeks oluşturulmayacak');
      return;
    }
    
    const Lobby = mongoose.models.Lobby;
    
    // Collection erişilebilir mi kontrol et
    if (Lobby && Lobby.collection) {
      console.log('Lobby koleksiyonu için indeks oluşturuluyor...');
      
      try {
        // Doğrudan indeks oluştur (önceki indeks kontrolü olmadan)
        await Lobby.collection.createIndex(
          { lobbyCode: 1 }, 
          { unique: true, background: true }
        );
        console.log('MongoDB Lobby koleksiyonu için indeks oluşturuldu');
      } catch (indexError) {
        // İndeks zaten varsa hata görmezden gel
        if (indexError.code === 11000 || indexError.message.includes('already exists')) {
          console.log('İndeks zaten var, devam ediliyor');
        } else {
          console.error('İndeks oluşturma hatası:', indexError);
          throw indexError;
        }
      }
    } else {
      console.log('Lobby modeli veya koleksiyonu hazır değil, indeks oluşturulmadı');
    }
  } catch (error) {
    console.error('İndeks oluşturma hatası:', error);
    throw error;
  }
};

// In-memory veritabanı kullanımı için hazırlık
const setupInMemoryMode = () => {
  console.log('In-memory mod aktifleştiriliyor...');
  
  // In-memory mod zaten aktif mi kontrol et
  if (global.dbFallback) {
    console.log('In-memory mod zaten aktif.');
    return;
  }
  
  // Geçici veri saklama yapıları
  global.inMemoryLobbies = new Map();
  global.inMemoryUsers = new Map();
  
  // MongoDB kesintilerinde kullanılacak yardımcı fonksiyonlar
  global.dbFallback = {
    findLobbyByCode: (code) => {
      console.log(`In-memory lobi arama: ${code}`);
      return global.inMemoryLobbies.get(code);
    },
    saveLobby: (lobby) => {
      console.log(`In-memory lobi kaydetme: ${lobby.lobbyCode}`);
      global.inMemoryLobbies.set(lobby.lobbyCode, lobby);
      return lobby;
    },
    deleteLobby: (code) => {
      console.log(`In-memory lobi silme: ${code}`);
      return global.inMemoryLobbies.delete(code);
    },
    getAllLobbies: () => {
      return Array.from(global.inMemoryLobbies.values());
    }
  };
  
  console.log('In-memory mod hazır');
  
  // Server başlangıcında zorunlu olarak in-memory modu kullanalım
  isMongoConnected = false;
  global.isMongoConnected = false;
};

// In-memory modu hemen aktifleştir (MongoDB bağlantısı beklemeden)
setupInMemoryMode();

// MongoDB bağlantısını başlat
connectWithRetry();

// MongoDB bağlantı durumu değiştiğinde
mongoose.connection.on('connected', () => {
  console.log('MongoDB bağlantısı yeniden kuruldu');
  isMongoConnected = true;
  global.isMongoConnected = true;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB bağlantısı kesildi, yeniden bağlanmayı deneyeceğiz...');
  isMongoConnected = false;
  global.isMongoConnected = false;
  setTimeout(() => {
    if (!isMongoConnected) {
      connectWithRetry();
    }
  }, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB bağlantı hatası:', err);
  isMongoConnected = false;
  global.isMongoConnected = false;
});

// API endpoint'lerini güncelle - lobi kodu ile sorgu
app.get('/api/lobbies/code/:code', async (req, res) => {
  const lobbyCode = req.params.code;
  
  try {
    console.log(`Lobi sorgulanıyor: ${lobbyCode}`);
    const startTime = Date.now();
    
    let lobby = null;
    
    if (isMongoConnected) {
      // MongoDB'den lobi bilgilerini getir
      lobby = await mongoose.model('Lobby')
        .findOne({ lobbyCode })
        .select('lobbyCode name game status players maxPlayers creator drawnNumbers currentNumber')
        .maxTimeMS(10000) // Sorgu zaman aşımı
        .lean(); // Performans için
      
      console.log(`MongoDB sorgu süresi: ${Date.now() - startTime}ms`);
    } else if (global.dbFallback) {
      // In-memory fallback kullan
      lobby = global.dbFallback.findLobbyByCode(lobbyCode);
      console.log('In-memory modunda lobi sorgulandı');
    }
    
    if (!lobby) {
      // Lobi bulunamadıysa, geçici lobi bilgisini oluştur
      console.log(`Lobi bulunamadı: ${lobbyCode}, geçici lobi oluşturuluyor`);
      
      // Geçici lobi bilgisini oluştur
      const tempLobby = {
        lobbyCode,
        name: `Tombala Lobisi ${lobbyCode}`,
        game: 'tombala',
        status: 'waiting',
        players: [],
        maxPlayers: 8,
        drawnNumbers: [],
        currentNumber: null,
        isTemporary: true,
        createdAt: new Date()
      };
      
      // In-memory cache'e ekle
      if (global.dbFallback) {
        global.dbFallback.saveLobby(tempLobby);
      }
      
      return res.status(200).json(tempLobby);
    }
    
    res.json(lobby);
  } catch (error) {
    console.error('Lobi sorgu hatası:', error);
    
    // Hata detaylarını logla ve client'a detaylı bilgi ver
    const errorDetail = error.message || 'Bilinmeyen hata';
    const errorCode = error.code || 500;
    
    res.status(500).json({ 
      error: 'Lobi bilgileri alınamadı',
      detail: errorDetail,
      code: errorCode,
      timestamp: new Date().toISOString(),
      // Client tarafı yönlendirme için
      retryAfter: 5,
      useFallback: true
    });
  }
});

// API endpoint - lobi durumu güncelleme
app.patch('/api/lobbies/status/:lobbyId', async (req, res) => {
  const { lobbyId } = req.params;
  const { status, gameData } = req.body;
  
  console.log(`Lobi durumu güncelleme isteği: ${lobbyId}, Status: ${status}`);
  
  try {
    let lobby = null;
    
    if (isMongoConnected) {
      // MongoDB'den lobi ara
      lobby = await mongoose.model('Lobby').findOne({ 
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? lobbyId : null },
          { lobbyCode: lobbyId }
        ]
      });
      
      if (lobby) {
        // Lobi durumunu güncelle
        lobby.status = status;
        
        // Oyun verilerini ekle
        if (gameData) {
          lobby.gameData = gameData;
          
          // Güncel çekilen sayılar
          if (gameData.drawnNumbers) {
            lobby.drawnNumbers = gameData.drawnNumbers;
          }
          
          // Güncel sayı
          if (gameData.currentNumber !== undefined) {
            lobby.currentNumber = gameData.currentNumber;
          }
        }
        
        lobby.updatedAt = new Date();
        await lobby.save();
        
        console.log(`Lobi durumu güncellendi: ${lobbyId}`);
        return res.json({
          success: true,
          id: lobby._id,
          lobbyCode: lobby.lobbyCode,
          status: lobby.status,
          updatedAt: lobby.updatedAt
        });
      }
    }
    
    // Lobi bulunamadı veya MongoDB bağlantısı yok - in-memory fallback
    if (global.dbFallback) {
      const inMemoryLobby = global.dbFallback.findLobbyByCode(lobbyId);
      
      if (inMemoryLobby) {
        // Lobi durumunu güncelle
        inMemoryLobby.status = status;
        
        // Oyun verilerini ekle
        if (gameData) {
          inMemoryLobby.gameData = gameData;
          
          if (gameData.drawnNumbers) {
            inMemoryLobby.drawnNumbers = gameData.drawnNumbers;
          }
          
          if (gameData.currentNumber !== undefined) {
            inMemoryLobby.currentNumber = gameData.currentNumber;
          }
        }
        
        inMemoryLobby.updatedAt = new Date();
        global.dbFallback.saveLobby(inMemoryLobby);
        
        console.log(`In-memory lobi durumu güncellendi: ${lobbyId}`);
        return res.json({
          success: true,
          lobbyCode: inMemoryLobby.lobbyCode,
          status: inMemoryLobby.status,
          updatedAt: inMemoryLobby.updatedAt,
          isTemporary: true
        });
      }
      
      // Lobi bulunamadı, yeni oluştur
      const tempLobby = {
        lobbyCode: lobbyId,
        name: `Tombala Lobisi ${lobbyId}`,
        game: 'tombala',
        status: status || 'waiting',
        players: [],
        maxPlayers: 8,
        drawnNumbers: gameData?.drawnNumbers || [],
        currentNumber: gameData?.currentNumber || null,
        gameData: gameData || {},
        isTemporary: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      global.dbFallback.saveLobby(tempLobby);
      
      console.log(`Yeni in-memory lobi oluşturuldu: ${lobbyId}`);
      return res.json({
        success: true,
        lobbyCode: tempLobby.lobbyCode,
        status: tempLobby.status,
        updatedAt: tempLobby.updatedAt,
        isTemporary: true,
        isNew: true
      });
    }
    
    // Son çare: Minimal yanıt
    return res.json({
      success: true,
      lobbyCode: lobbyId,
      status: status || 'waiting',
      updatedAt: new Date().toISOString(),
      isMinimal: true
    });
  } catch (error) {
    console.error('Lobi durumu güncelleme hatası:', error);
    
    res.status(500).json({
      success: false,
      error: 'Lobi durumu güncellenirken bir hata oluştu',
      detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Lobiye oyuncu ekleme fonksiyonu ekle
app.post('/api/lobbies/:lobbyId/players', async (req, res) => {
  try {
    const { lobbyId } = req.params;
    const { playerId, playerName, isBot, profileImage } = req.body;
    
    console.log(`Lobiye oyuncu ekleme isteği: Lobi=${lobbyId}, Oyuncu=${playerId}, İsim=${playerName}`);
    
    if (!lobbyId || !playerId) {
      return res.status(400).json({ success: false, message: 'Lobi ID ve oyuncu ID gerekli' });
    }
    
    // Lobi bilgilerini al
    const lobby = await Lobby.findOne({ 
      $or: [
        { lobbyCode: lobbyId }, 
        { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? mongoose.Types.ObjectId(lobbyId) : null }
      ]
    });
    
    if (!lobby) {
      return res.status(404).json({ success: false, message: 'Lobi bulunamadı' });
    }
    
    // Oyuncu zaten var mı kontrol et
    const existingPlayerIndex = lobby.playersDetail.findIndex(p => 
      p.user.toString() === playerId
    );
    
    if (existingPlayerIndex >= 0) {
      // Oyuncu zaten var, güncelle
      lobby.playersDetail[existingPlayerIndex].name = playerName || lobby.playersDetail[existingPlayerIndex].name;
      lobby.playersDetail[existingPlayerIndex].isBot = isBot || lobby.playersDetail[existingPlayerIndex].isBot;
      
      // Profil resmi varsa güncelle
      if (profileImage) {
        lobby.playersDetail[existingPlayerIndex].profileImage = profileImage;
      }
    } else {
      // Oyuncu ekle
      lobby.playersDetail.push({
        user: mongoose.Types.ObjectId(playerId),
        name: playerName || 'Misafir Oyuncu',
        isBot: isBot || false,
        profileImage: profileImage || null,
        joinedAt: new Date()
      });
      
      // players dizisine de ekle
      if (!lobby.players.some(p => p.toString() === playerId)) {
        lobby.players.push(mongoose.Types.ObjectId(playerId));
      }
    }
    
    // Mongo için değişiklikleri işaretle
    lobby.markModified('playersDetail');
    lobby.markModified('players');
    
    // Kaydet
    await lobby.save();
    
    // Socket.io üzerinden bildiri gönder
    if (req.app.get('io')) {
      const io = req.app.get('io');
      
      // Dönüştürülmüş oyuncu listesi
      const mappedPlayers = lobby.playersDetail.map(player => {
        // Null kontrol
        if (!player.user) {
          return {
            id: `bot-${player._id || Math.random().toString(36).substring(2, 9)}`,
            name: player.name || 'Bot Oyuncu',
            isBot: true,
            isHost: false,
            isReady: player.isReady || false,
            profileImage: player.profileImage || null
          };
        }
        
        return {
          id: player.user.toString(),
          name: player.name,
          isBot: player.isBot || false,
          isHost: player.user.toString() === lobby.creator.toString(),
          isReady: player.isReady || false,
          profileImage: player.profileImage || null
        };
      });
      
      // Yeni oyuncu katıldı bildirimi
      io.to(lobbyId).emit('player_joined', {
        playerId,
        playerName: playerName || 'Yeni Oyuncu',
        players: mappedPlayers
      });
      
      // Lobi bilgilerini güncelle
      io.to(lobbyId).emit('lobby_info', {
        lobbyId: lobby.lobbyCode,
        status: lobby.status,
        drawnNumbers: lobby.drawnNumbers || [],
        currentNumber: lobby.currentNumber,
        players: mappedPlayers
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Oyuncu lobiye eklendi',
      playerId,
      lobbyId: lobby.lobbyCode
    });
  } catch (error) {
    console.error('Oyuncu ekleme hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Oyuncu eklenirken bir hata oluştu',
      error: error.message
    });
  }
});

// Server'ı başlat - değiştirilmiş ve geliştirilmiş port yapılandırması
    const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ┌─────────────────────────────────────────────────┐
  │                                                 │
  │   Game Center Server başarıyla başlatıldı!      │
  │                                                 │
  │   Tarih: ${new Date().toISOString()}            │
  │   Port: ${PORT}                                 │
  │   Mod: ${process.env.NODE_ENV || 'development'} │
  │   URL: http://localhost:${PORT}                 │
  │                                                 │
  └─────────────────────────────────────────────────┘
  `);
  
  // Socket.io durumunu logla
  console.log(`Socket.io bağlantı durumu: ${io ? 'aktif' : 'pasif'}`);
  console.log(`Kullanılan transport metotları: ${io.engine.opts.transports.join(', ')}`);
  console.log(`Aktif HTTP engine: ${io.engine.name}`);
  
  // Sistem bilgilerini logla
  console.log(`Sistem memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`);
  console.log(`Node.js versiyon: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM sinyali alındı, sunucu kapatılıyor...');
  
  // Aktif socket bağlantılarını kapat
  io.close(() => {
    console.log('Socket.io bağlantıları kapatıldı');
    
    // HTTP sunucusunu kapat
    server.close(() => {
      console.log('HTTP sunucusu kapatıldı');
      
      // MongoDB bağlantısını kapat
      if (mongoose.connection.readyState === 1) {
        mongoose.connection.close(() => {
          console.log('MongoDB bağlantısı kapatıldı');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
  });
  
  // 10 saniye içinde normal shutdown olmazsa zorla kapat
  setTimeout(() => {
    console.error('Graceful shutdown zaman aşımı, zorla kapatılıyor...');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', () => {
  console.log('SIGINT sinyali alındı, sunucu kapatılıyor...');
  
  // Aktif socket bağlantılarını kapat
  io.close(() => {
    // HTTP sunucusunu kapat
    server.close(() => {
      // MongoDB bağlantısını kapat
      if (mongoose.connection.readyState === 1) {
        mongoose.connection.close(() => {
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
  });
  
  // 5 saniye içinde normal shutdown olmazsa zorla kapat
  setTimeout(() => {
    console.error('Graceful shutdown zaman aşımı, zorla kapatılıyor...');
    process.exit(1);
  }, 5000);
});
