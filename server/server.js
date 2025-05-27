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

// Sayaç yönetimi için global değişkenler
const lobbyCountdowns = new Map(); // lobbyId -> {countdown: number, interval: intervalId, gameSpeed: string}

// Oyun hızına göre sayaç süresini belirle
const getCountdownDuration = (gameSpeed = 'normal') => {
  switch (gameSpeed) {
    case 'slow': return 15;
    case 'fast': return 5;
    default: return 10; // normal
  }
};

// Sayaç başlatma fonksiyonu
const startCountdown = (lobbyId, gameSpeed = 'normal', isPaused = false) => {
  // Eğer lobi için zaten bir sayaç çalışıyorsa, onu temizle
  if (lobbyCountdowns.has(lobbyId)) {
    clearInterval(lobbyCountdowns.get(lobbyId).interval);
  }
  
  // Oyun duraklatılmışsa sayaç başlatma
  if (isPaused) {
    lobbyCountdowns.set(lobbyId, {
      countdown: getCountdownDuration(gameSpeed),
      interval: null,
      gameSpeed,
      isPaused: true
    });
    return;
  }
  
  // Yeni sayaç başlat
  const countdownDuration = getCountdownDuration(gameSpeed);
  let countdown = countdownDuration;
  
  console.log(`Sayaç başlatılıyor: Lobi=${lobbyId}, Süre=${countdownDuration}, Hız=${gameSpeed}`);
  
  const interval = setInterval(async () => {
    try {
      // Sayaç değerini azalt
      countdown--;
      
      // Sayaç durumunu güncelle
      lobbyCountdowns.set(lobbyId, {
        countdown,
        interval,
        gameSpeed,
        isPaused: false
      });
      
      // Tüm oyunculara güncel sayaç değerini gönder
      io.to(lobbyId).emit('countdown_update', {
        countdown,
        lobbyId,
        timestamp: Date.now()
      });
      
      console.log(`Sayaç güncellendi: Lobi=${lobbyId}, Kalan=${countdown}`);
      
      // Sayaç sıfıra ulaştığında yeni sayı çek
      if (countdown <= 0) {
        console.log(`Sayaç sıfıra ulaştı, otomatik sayı çekiliyor: Lobi=${lobbyId}`);
        
        // Lobi bilgilerini al
        const lobby = await Lobby.findOne({ 
          $or: [
            { lobbyCode: lobbyId }, 
            { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
          ]
        });
        
        if (!lobby) {
          console.error(`Lobi bulunamadı: ${lobbyId}, sayaç durduruldu`);
          clearInterval(interval);
          lobbyCountdowns.delete(lobbyId);
          return;
        }
        
        // Oyun duraklatılmış mı kontrol et
        if (lobby.isPaused) {
          console.log(`Oyun duraklatılmış, sayı çekilmiyor: Lobi=${lobbyId}`);
          return;
        }
        
        // Oyun bitmişse sayacı durdur
        if (lobby.status !== 'playing') {
          console.log(`Oyun bitti, sayaç durduruldu: Lobi=${lobbyId}`);
          clearInterval(interval);
          lobbyCountdowns.delete(lobbyId);
          return;
        }
        
        // Tüm sayılar çekildiyse sayacı durdur
        if (lobby.drawnNumbers && lobby.drawnNumbers.length >= 90) {
          console.log(`Tüm sayılar çekildi, sayaç durduruldu: Lobi=${lobbyId}`);
          clearInterval(interval);
          lobbyCountdowns.delete(lobbyId);
          return;
        }
        
        // Yeni sayı çek
        const nextNumber = getRandomNumber(lobby.drawnNumbers || []);
        
        if (nextNumber === null) {
          console.log('Çekilecek yeni sayı kalmadı!');
          clearInterval(interval);
          lobbyCountdowns.delete(lobbyId);
          return;
        }
        
        // Sayıyı ekle
        if (!lobby.drawnNumbers) lobby.drawnNumbers = [];
        lobby.drawnNumbers.push(nextNumber);
        lobby.currentNumber = nextNumber;
        
        // Mongo için güncellemeyi işaretle
        lobby.markModified('drawnNumbers');
        
        // Veritabanına kaydet
        await lobby.save();
        
        // Sayacı yeniden başlat
        countdown = countdownDuration;
        
        // Tüm oyunculara yeni sayıyı bildir
        io.to(lobbyId).emit('number_drawn', {
          number: nextNumber,
          drawnNumbers: lobby.drawnNumbers,
          timestamp: Date.now(),
          totalDrawn: lobby.drawnNumbers.length,
          countdown: countdown,
          isPaused: lobby.isPaused || false,
          autoDrawEnabled: !(lobby.isPaused || false)
        });
        
        console.log(`Yeni sayı çekildi: ${nextNumber} - Toplam: ${lobby.drawnNumbers.length}/90`);
        
        // Tüm sayılar çekildiyse oyunu bitir
        if (lobby.drawnNumbers.length >= 90) {
          console.log(`Tüm sayılar çekildi, oyun bitiyor: Lobi=${lobbyId}`);
          clearInterval(interval);
          lobbyCountdowns.delete(lobbyId);
          
          lobby.status = 'finished';
          await lobby.save();
          
          io.to(lobbyId).emit('game_end', { 
            message: 'Tüm sayılar çekildi, oyun bitti!',
            allNumbersDrawn: true
          });
        }
      }
    } catch (error) {
      console.error(`Sayaç hatası (Lobi=${lobbyId}):`, error);
    }
  }, 1000);
  
  // Sayaç bilgilerini kaydet
  lobbyCountdowns.set(lobbyId, {
    countdown,
    interval,
    gameSpeed,
    isPaused: false
  });
  
  return countdown;
};

// Sayaç durdurma fonksiyonu
const stopCountdown = (lobbyId) => {
  if (lobbyCountdowns.has(lobbyId)) {
    clearInterval(lobbyCountdowns.get(lobbyId).interval);
    lobbyCountdowns.delete(lobbyId);
    console.log(`Sayaç durduruldu: Lobi=${lobbyId}`);
  }
};

// Sayaç duraklatma/devam ettirme fonksiyonu
const toggleCountdown = async (lobbyId, isPaused) => {
  try {
    // Lobi bilgilerini al
    const lobby = await Lobby.findOne({ 
      $or: [
        { lobbyCode: lobbyId }, 
        { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
      ]
    });
    
    if (!lobby) {
      console.error(`Lobi bulunamadı: ${lobbyId}, sayaç işlemi yapılamadı`);
      return;
    }
    
    // Mevcut sayaç bilgilerini al
    const countdownInfo = lobbyCountdowns.get(lobbyId);
    
    if (isPaused) {
      // Sayaç duraklatılıyor
      if (countdownInfo && countdownInfo.interval) {
        clearInterval(countdownInfo.interval);
        
        lobbyCountdowns.set(lobbyId, {
          ...countdownInfo,
          interval: null,
          isPaused: true
        });
        
        console.log(`Sayaç duraklatıldı: Lobi=${lobbyId}, Kalan=${countdownInfo.countdown}`);
      }
    } else {
      // Sayaç devam ettiriliyor
      if (countdownInfo) {
        // Mevcut sayaç bilgilerini kullanarak yeniden başlat
        startCountdown(lobbyId, lobby.gameSpeed || 'normal', false);
        console.log(`Sayaç devam ettiriliyor: Lobi=${lobbyId}`);
      } else {
        // Yeni sayaç başlat
        startCountdown(lobbyId, lobby.gameSpeed || 'normal', false);
      }
    }
    
    // Tüm oyunculara güncel sayaç durumunu bildir
    const currentCountdown = lobbyCountdowns.get(lobbyId);
    if (currentCountdown) {
      io.to(lobbyId).emit('countdown_update', {
        countdown: currentCountdown.countdown,
        lobbyId,
        isPaused,
        timestamp: Date.now()
      });
    }
    
  } catch (error) {
    console.error(`Sayaç durumu değiştirme hatası (Lobi=${lobbyId}):`, error);
  }
};

// Tombala yardımcı fonksiyonlarını içe aktar veya tanımla
// Bir oyuncunun kartında 15 işaretli sayı olup olmadığını kontrol et
const checkForTombalaByMarkedCount = (card, drawnNumbers) => {
  // Geçerlilik kontrolleri
  if (!card || !Array.isArray(card) || !Array.isArray(drawnNumbers)) {
    console.error('Geçersiz kart veya drawnNumbers:', { card, drawnNumbersLength: drawnNumbers?.length });
    return { isTombala: false, markedCount: 0, markedLocations: [] };
  }
  
  try {
    // Kart formatını doğrula
    if (card.length !== 3) {
      console.error('Kart 3 satır içermiyor:', card.length);
      return { isTombala: false, markedCount: 0, markedLocations: [] };
    }
    
    // Karttaki tüm sayıları ve konumlarını kaydet
    const allNumbersWithLocations = [];
    for (let row = 0; row < card.length; row++) {
      if (!Array.isArray(card[row])) {
        console.error(`Kart satır ${row} dizi değil:`, card[row]);
        continue;
      }
      
      for (let col = 0; col < card[row].length; col++) {
        const num = card[row][col];
        if (num !== null && num !== undefined) {
          allNumbersWithLocations.push({ number: num, row, col });
        }
      }
    }
  
  // İşaretlenen sayıları bul
    const markedLocations = [];
    for (const item of allNumbersWithLocations) {
      if (drawnNumbers.includes(item.number)) {
        markedLocations.push(item);
      }
    }
  
  // İşaretlenen sayı sayısı
    const markedCount = markedLocations.length;
    
    // Kartın toplam sayı sayısını kontrol et
    const totalNumbers = allNumbersWithLocations.length;
    if (totalNumbers !== 15 && totalNumbers !== 0) {
      console.warn(`Uyarı: Kart toplam sayı sayısı 15 değil: ${totalNumbers}`);
    }
  
  // Tombala durumu - 15 işaretli sayı olduğunda tombala
    const isTombala = markedCount === 15 && totalNumbers === 15;
  
    console.log(`İşaretli sayı kontrolü: ${markedCount}/${totalNumbers} - Tombala: ${isTombala}`);
  
    return { isTombala, markedCount, markedLocations, totalNumbers };
  } catch (error) {
    console.error('Tombala kontrolü sırasında hata:', error);
    return { isTombala: false, markedCount: 0, markedLocations: [], error: error.message };
  }
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

// Bot yardımcı fonksiyonları
const botHelpers = {
  // Bot için kart oluştur
  createBotCards: (cardCount = 1) => {
    const cards = generateTombalaCards(cardCount);
    console.log(`Bot için ${cardCount} kart oluşturuldu:`, JSON.stringify(cards).substring(0, 100) + '...');
    return cards;
  },
  
  // Bot için çinko kontrolü
  checkForCinko: (card, drawnNumbers) => {
    if (!card || !Array.isArray(card) || !Array.isArray(drawnNumbers)) {
      return { hasCinko: false, cinkoType: null, rowIndex: -1 };
    }
    
    // Her satır için çinko kontrolü yap
    for (let rowIndex = 0; rowIndex < card.length; rowIndex++) {
      const row = card[rowIndex];
      const rowNumbers = row.filter(num => num !== null);
      const markedRowNumbers = rowNumbers.filter(num => drawnNumbers.includes(num));
      
      // Tüm sayılar işaretlenmişse (5 sayı) çinko var
      if (markedRowNumbers.length === rowNumbers.length && rowNumbers.length === 5) {
        console.log(`Bot'un kartında çinko tespit edildi! Satır: ${rowIndex+1}, İşaretli sayılar: [${markedRowNumbers.join(', ')}]`);
        return { hasCinko: true, rowIndex, cinkoType: rowIndex === 0 ? 'cinko1' : 'cinko2' };
      }
    }
    
    return { hasCinko: false, cinkoType: null, rowIndex: -1 };
  },
  
  // Bot için tombala kontrolü
  checkForTombala: (card, drawnNumbers) => {
    const result = checkForTombalaByMarkedCount(card, drawnNumbers);
    if (result.isTombala) {
      console.log(`Bot'un kartında TOMBALA tespit edildi! Toplam işaretli sayı: ${result.markedCount}/15`);
      console.log(`Bot kartı: ${JSON.stringify(card)}`);
    }
    return result;
  },
  
  // Bot için hareket kararı al
  decideBotMove: (bot, lobby) => {
    // Oyunun durumunu kontrol et
    if (!lobby || lobby.status !== 'playing' || !bot || !bot.cards || !Array.isArray(lobby.drawnNumbers)) {
      return null;
    }
    
    // Bot'un kartını al
    const botCard = bot.cards[0]; // İlk kartı kullan
    if (!botCard) return null;
    
    // Son çekilen sayıyı al
    const lastNumber = lobby.currentNumber;
    
    // Son çekilen sayı kartın içinde mi kontrol et
    if (lastNumber) {
      console.log(`Bot ${bot.name} son çekilen sayı kontrolü - Sayı: ${lastNumber}`);
      let isNumberFound = false;
      // Tüm kartı kontrol et
      for (let row = 0; row < botCard.length; row++) {
        for (let col = 0; col < botCard[row].length; col++) {
          if (botCard[row][col] === lastNumber) {
            console.log(`Bot ${bot.name}'ın kartında ${lastNumber} sayısı bulunuyor - Konum: [${row+1}, ${col+1}]`);
            isNumberFound = true;
            break;
          }
        }
        if (isNumberFound) break;
      }
      
      if (!isNumberFound) {
        console.log(`Bot ${bot.name}'ın kartında ${lastNumber} sayısı bulunamadı`);
      }
    }
    
    // Tombala kontrolü
    const tombalaCheck = botHelpers.checkForTombala(botCard, lobby.drawnNumbers);
    if (tombalaCheck.isTombala) {
      console.log(`Bot ${bot.name} TOMBALA yapabilir! İşaretli: ${tombalaCheck.markedCount}/15`);
      return { action: 'claim_tombala', cardIndex: 0 };
    }
    
    // Çinko kontrolü
    const cinkoCheck = botHelpers.checkForCinko(botCard, lobby.drawnNumbers);
    if (cinkoCheck.hasCinko) {
      // Eğer bu satır için çinko talebi zaten yapılmış mı kontrol et
      const cinkoType = cinkoCheck.cinkoType;
      const claimedCinko = lobby.winners?.[cinkoType];
      
      if (!claimedCinko) {
        console.log(`Bot ${bot.name} ${cinkoType.toUpperCase()} yapabilir! Satır: ${cinkoCheck.rowIndex+1}`);
        return { action: 'claim_cinko', cinkoType, cardIndex: 0, rowIndex: cinkoCheck.rowIndex };
      } else {
        console.log(`Bot ${bot.name} ${cinkoType} yapabilir ancak zaten kazananı var. Kazanan: ${claimedCinko.playerName}`);
      }
    }
    
    return null;
  },
  
  // Bot için hareket yap
  makeBotMove: async (bot, lobby) => {
    try {
      // Kartta sorun var mı kontrol et
      if (!bot.cards || !Array.isArray(bot.cards) || bot.cards.length === 0) {
        console.log(`Bot ${bot.name} için kartlar eksik, kartları oluşturuyoruz...`);
        // Lobi'deki tüm botların kartlarını oluştur - daha güvenli
        const cardResult = await createAndSaveBotCards(lobby);
        if (cardResult.success && cardResult.lobby) {
          console.log(`Bot kartları oluşturuldu: ${cardResult.message}`);
          lobby = cardResult.lobby; // Güncellenmiş lobi bilgilerini kullan
          
          // Güncel lobi içinde botu tekrar bul
          const updatedBot = lobby.playersDetail.find(p => 
            (p._id && p._id.toString() === bot._id.toString()) || 
            (p.id && p.id.toString() === bot._id.toString())
          );
          
          if (updatedBot && updatedBot.cards && Array.isArray(updatedBot.cards) && updatedBot.cards.length > 0) {
            console.log(`Bot ${bot.name} için kartlar başarıyla güncellendi.`);
            bot = updatedBot; // Güncellenmiş bot bilgilerini kullan
          } else {
            console.log(`Bot ${bot.name} için kartlar güncellenemedi, hamle yapılamayacak.`);
            return;
          }
        } else {
          console.error('Bot kartları oluşturulamadı:', cardResult.message);
          return;
        }
      }
      
      // Kartı güncellendikten sonra tekrar kontrol et
      if (!bot.cards || !Array.isArray(bot.cards) || bot.cards.length === 0) {
        console.log(`Bot ${bot.name} için kartlar hala bulunamadı, hamle yapamayacak`);
        return;
      }
      
      const move = botHelpers.decideBotMove(bot, lobby);
      if (!move) {
        console.log(`Bot ${bot.name} için uygun hamle bulunamadı`);
        return;
      }
      
      // Bot hareketi türüne göre işlem yap
      switch (move.action) {
        case 'claim_cinko': {
          console.log(`Bot ${bot.name} ${move.cinkoType} talep ediyor!`);
          
          // Bot için çinko talebi oluştur
          const claimResult = await handleCinkoClaim({
            lobbyId: lobby._id ? lobby._id.toString() : lobby._id,
            playerId: bot._id ? bot._id.toString() : bot._id,
            cinkoType: move.cinkoType,
            cardIndex: move.cardIndex,
            isBot: true
          }, io);
          
          console.log(`Bot ${bot.name} çinko talebi sonucu:`, JSON.stringify(claimResult));
          break;
        }
        
        case 'claim_tombala': {
          console.log(`Bot ${bot.name} TOMBALA talep ediyor!`);
          
          // Bot için tombala talebi oluştur
          const claimResult = await handleTombalaClaim({
            lobbyId: lobby._id ? lobby._id.toString() : lobby._id,
            playerId: bot._id ? bot._id.toString() : bot._id,
            cardIndex: move.cardIndex,
            isBot: true
          }, io);
          
          console.log(`Bot ${bot.name} tombala talebi sonucu:`, JSON.stringify(claimResult));
          break;
        }
      }
    } catch (error) {
      console.error(`Bot ${bot.name} hareket hatası:`, error);
    }
  },
  
  // Bot için düşünme süresini hesapla (insanlaştırma için)
  calculateThinkTime: () => {
    // 1-3 saniye arası rastgele düşünme süresi
    return Math.floor(Math.random() * 2000) + 1000;
  }
};

// Bot hareketlerini kontrol etme fonksiyonu
const processBotMoves = async (lobby) => {
  try {
    if (!lobby || !lobby.playersDetail || lobby.status !== 'playing') {
      console.log('processBotMoves: Lobi oyun durumunda değil, botlar işlenmeyecek');
      return;
    }
    
    // Tüm botları filtrele
    const bots = lobby.playersDetail.filter(player => player.isBot === true);
    
    if (bots.length === 0) {
      console.log('processBotMoves: Lobide bot yok');
      return;
    }
    
    console.log(`processBotMoves: ${bots.length} bot için hamleler kontrol ediliyor`);
    
    // İlk önce tüm botların kartlarını oluştur ve kaydet
    const cardResult = await createAndSaveBotCards(lobby);
    if (cardResult.success && cardResult.lobby) {
      console.log(`Bot kartları oluşturuldu: ${cardResult.message}`);
      lobby = cardResult.lobby; // Güncellenmiş lobi bilgilerini kullan
    } else {
      console.error('Bot kartları oluşturulamadı:', cardResult.message);
    }
    
    // Şimdi her bot için hamleleri kontrol et
    for (const bot of bots) {
      if (!bot.cards || !Array.isArray(bot.cards) || bot.cards.length === 0) {
        console.log(`Bot ${bot.name} için kartlar hala bulunamadı, hamle yapamayacak`);
        continue;
      }
      
      // Botun kartını ve son çekilen sayıyı kontrol et
      console.log(`Bot ${bot.name || 'İsimsiz'} hareketi inceleniyor, son çekilen sayı: ${lobby.currentNumber}`);
      
      // Bot kararını hemen hesapla ve uygula
      const move = botHelpers.decideBotMove(bot, lobby);
      if (move) {
        console.log(`Bot ${bot.name} için karar: ${move.action}`);
        
        // İnsan davranışı taklit etmek için rastgele gecikme
        const thinkTime = botHelpers.calculateThinkTime();
        console.log(`Bot ${bot.name} ${thinkTime}ms düşünme süresi ile hareket yapacak`);
        
        setTimeout(async () => {
          try {
            // Oyun durumunu tekrar kontrol et (eğer başka bir bot daha önce tombala yapmışsa)
            const currentLobby = await Lobby.findById(lobby._id);
            if (currentLobby && currentLobby.status === 'playing') {
              await botHelpers.makeBotMove(bot, currentLobby);
            } else {
              console.log(`Bot ${bot.name} hamle yapmadı, oyun durumu değişmiş: ${currentLobby?.status}`);
            }
          } catch (botMoveError) {
            console.error(`Bot ${bot.name} hareket hatası:`, botMoveError);
          }
        }, thinkTime);
      } else {
        console.log(`Bot ${bot.name} için şu anda yapılacak hamle yok`);
      }
    }
  } catch (error) {
    console.error('processBotMoves genel hatası:', error);
  }
};

// Çinko talebi işleme fonksiyonu
const handleCinkoClaim = async (data, socketIo) => {
  try {
    const { lobbyId, playerId, cinkoType, cardIndex, isBot = false } = data;
    
    console.log(`Çinko talebi: Lobi=${lobbyId}, Oyuncu=${playerId}, Tür=${cinkoType}, Kart=${cardIndex}, Bot=${isBot}`);
    
    // Lobi bilgilerini al
    const lobby = await Lobby.findOne({ 
      $or: [
        { lobbyCode: lobbyId }, 
        { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
      ]
    });
    
    if (!lobby) {
      return { success: false, message: 'Lobi bulunamadı' };
    }
    
    // Eğer oyun başlamadıysa hata ver
    if (lobby.status !== 'playing') {
      return { success: false, message: 'Oyun henüz başlamadı' };
    }
    
    // Oyuncunun detaylarını bul
    let playerDetail;
    
    if (isBot) {
      // Bot için _id veya id ile eşleştir
      playerDetail = lobby.playersDetail.find(p => 
        (p._id && p._id.toString() === playerId.toString()) || 
        (p.id && p.id.toString() === playerId.toString())
      );
      
      console.log(`Bot oyuncu arama: ${playerId}, Bulundu: ${playerDetail ? 'Evet' : 'Hayır'}`);
      
      // Bulunamazsa, botları loglayıp detay göster
      if (!playerDetail) {
        console.log(`Tüm botlar:`, lobby.playersDetail.filter(p => p.isBot).map(b => ({ 
          id: b._id ? b._id.toString() : 'ID yok', 
          name: b.name || 'İsimsiz bot'
        })));
      }
    } else {
      // Normal oyuncu için user alanı ile eşleştir
      playerDetail = lobby.playersDetail.find(p => p.user && p.user.toString() === playerId.toString());
    }
    
    if (!playerDetail) {
      return { success: false, message: 'Oyuncu bulunamadı' };
    }
    
    // Oyuncunun adını al
    const playerName = playerDetail.name || 'Bilinmeyen Oyuncu';
    
    // Oyuncunun kartını kontrol et
    if (!playerDetail.cards || !playerDetail.cards[cardIndex]) {
      return { success: false, message: 'Kart bulunamadı' };
    }
    
    // İlgili çinko türü için kazanan zaten var mı kontrol et
    if (lobby.winners && lobby.winners[cinkoType]) {
      return { success: false, message: `Bu ${cinkoType} zaten kazananı var` };
    }
    
    // Çinko kontrolü yap
    const card = playerDetail.cards[cardIndex];
    const { hasCinko, rowIndex } = botHelpers.checkForCinko(card, lobby.drawnNumbers);
    
    if (!hasCinko) {
      return { success: false, message: 'Geçerli çinko bulunamadı' };
    }
    
    console.log(`Çinko geçerli: Oyuncu=${playerName}, Tür=${cinkoType}, Satır=${rowIndex}`);
    
    // Çinko kazananını kaydet
    if (!lobby.winners) {
      lobby.winners = {};
    }
    
    lobby.winners[cinkoType] = {
      playerId,
      playerName,
      cardIndex,
      rowIndex,
      timestamp: Date.now()
    };
    
    // Mongo için değişiklikleri işaretle
    lobby.markModified('winners');
    await lobby.save();
    
    // Socket.io ile diğer oyunculara bildir
    if (socketIo) {
      socketIo.to(lobbyId).emit(`${cinkoType}_claimed`, {
        playerId,
        playerName,
        cardIndex,
        rowIndex,
        timestamp: Date.now()
      });
      
      // Bildiri mesajı
      socketIo.to(lobbyId).emit('notification', {
        type: 'success',
        message: `${playerName} ${cinkoType === 'cinko1' ? '1. Çinko' : '2. Çinko'} yaptı!`,
        timestamp: Date.now()
      });
    }
    
    return { 
      success: true, 
      message: 'Çinko başarıyla talep edildi',
      cinkoType,
      rowIndex
    };
  } catch (error) {
    console.error('Çinko talebi hatası:', error);
    return { success: false, message: 'Çinko talebinde hata: ' + error.message };
  }
};

// Tombala talebi işleme fonksiyonu
const handleTombalaClaim = async (data, socketIo) => {
  try {
    const { lobbyId, playerId, cardIndex, isBot = false } = data;
    
    console.log(`Tombala talebi: Lobi=${lobbyId}, Oyuncu=${playerId || playerName}`);
    
    // Lobi bilgilerini al
    const lobby = await Lobby.findOne({ 
      $or: [
        { lobbyCode: lobbyId }, 
        { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
      ]
    });
    
    if (!lobby) {
      console.error(`Lobi bulunamadı: ${lobbyId}`);
      return { success: false, message: 'Lobi bulunamadı' };
    }
    
    // Eğer oyun başlamadıysa hata ver
    if (lobby.status !== 'playing') {
      console.error(`Oyun başlamadı veya bitti, tombala talep edilemez. Mevcut durum: ${lobby.status}`);
      return { success: false, message: 'Oyun henüz başlamadı veya bitti' };
    }
    
    // Tombala kazananı zaten var mı kontrol et
    if (lobby.winners && lobby.winners.tombala) {
      console.log(`Bu oyunun zaten bir tombala kazananı var: ${lobby.winners.tombala.playerName}`);
      return { success: false, message: 'Bu oyunun zaten bir tombala kazananı var' };
    }
    
    // Oyuncunun detaylarını bul
    let playerDetail;
    
    if (isBot) {
      // Bot için _id veya id ile eşleştir
      playerDetail = lobby.playersDetail.find(p => 
        (p._id && p._id.toString() === playerId.toString()) || 
        (p.id && p.id.toString() === playerId.toString())
      );
      
      console.log(`Bot oyuncu arama: ${playerId}, Bulundu: ${playerDetail ? 'Evet' : 'Hayır'}`);
      
      // Bulunamazsa, botları loglayıp detay göster
      if (!playerDetail) {
        console.log(`Tüm botlar:`, lobby.playersDetail.filter(p => p.isBot).map(b => ({ 
          id: b._id ? b._id.toString() : 'ID yok', 
          name: b.name || 'İsimsiz bot'
        })));
      }
    } else {
      // Normal oyuncu için user alanı ile eşleştir
      playerDetail = lobby.playersDetail.find(p => p.user && p.user.toString() === playerId.toString());
    }
    
    if (!playerDetail) {
      console.error(`Oyuncu bulunamadı: ${playerId}`);
      return { success: false, message: 'Oyuncu bulunamadı' };
    }
    
    // Oyuncunun adını al
    const playerName = playerDetail.name || 'Bilinmeyen Oyuncu';
    
    // Oyuncunun kartını kontrol et
    if (!playerDetail.cards || !playerDetail.cards[cardIndex]) {
      console.error(`Kart bulunamadı: Oyuncu=${playerName}, Kart index=${cardIndex}`);
      return { success: false, message: 'Kart bulunamadı' };
    }
    
    // Tombala kontrolü yap
    const card = playerDetail.cards[cardIndex];
    const result = checkForTombalaByMarkedCount(card, lobby.drawnNumbers);
    
    if (!result.isTombala) {
      console.log(`Tombala geçersiz: Oyuncu=${playerName}, İşaretli sayı=${result.markedCount}/15`);
      return { success: false, message: 'Tombala geçerli değil, tüm sayılar işaretlenmemiş' };
    }
    
    console.log(`Tombala geçerli: Oyuncu=${playerName}, KartIndex=${cardIndex}, İşaretli sayı=${result.markedCount}/${result.totalNumbers}`);
    
    // İşaretli lokasyonları logla
    if (result.markedLocations && Array.isArray(result.markedLocations)) {
      console.log(`İşaretli sayı lokasyonları:`, JSON.stringify(result.markedLocations));
    }
    
    // Tombala kazananını kaydet
    if (!lobby.winners) {
      lobby.winners = {};
    }
    
    lobby.winners.tombala = {
      playerId,
      playerName,
      cardIndex,
      isBot,
      timestamp: Date.now()
    };
    
    // Oyunu bitir
    lobby.status = 'finished';
    lobby.finishedAt = new Date();
    
    // Mongo için değişiklikleri işaretle
    lobby.markModified('winners');
    await lobby.save();
    console.log(`Oyun sonlandı. Kazanan: ${playerName}, Bot mu: ${isBot}`);
    
    // Socket.io ile diğer oyunculara bildir
    if (socketIo) {
      socketIo.to(lobbyId).emit('tombala_claimed', {
        playerId,
        playerName,
        cardIndex,
        isBot,
        timestamp: Date.now()
      });
      
      // Oyun sonu bildirimi
      socketIo.to(lobbyId).emit('game_end', {
        winner: {
          playerId,
          playerName,
          isBot
        },
        timestamp: Date.now()
      });
      
      // Bildiri mesajı
      socketIo.to(lobbyId).emit('notification', {
        type: 'success',
        message: `${isBot ? '🤖 ' : ''}${playerName} TOMBALA yaptı ve oyunu kazandı!`,
        timestamp: Date.now()
      });
    }
    
    // Sayacı durdur
    stopCountdown(lobbyId);
    
    return { 
      success: true, 
      message: 'Tombala başarıyla talep edildi',
      playerName,
      isBot,
      gameFinished: true
    };
  } catch (error) {
    console.error('Tombala talebi hatası:', error);
    return { success: false, message: 'Tombala talebinde hata: ' + error.message };
  }
};

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

// Kart üretme fonksiyonunu diğer modüllerin erişimine aç
app.set('generateTombalaCards', generateTombalaCards);

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
io.on('connection', async (socket) => {
  console.log('Socket.io bağlantısı kuruldu, Socket ID:', socket.id);
  
  // Bir sayı çekme isteği geldiğinde
  socket.on('draw_number', async (data) => {
    try {
      const { lobbyId, playerId, isManualDraw = false, keepPausedState = false, keepAutoDrawState = true, isHost = false, manualDrawPermission = 'host-only' } = data;
      
      console.log(`Manuel çekme: ${isManualDraw}, Duraklatma durumunu koru: ${keepPausedState}`);
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID eksik!' });
        return;
      }
      
      // Manuel sayı çekme yetkisi kontrolü
      const canDrawManually = isHost || manualDrawPermission === 'all-players';
      
      if (isManualDraw && !canDrawManually) {
        console.log(`Sayı çekme yetkisi reddedildi. Host: ${isHost}, İzin: ${manualDrawPermission}`);
        socket.emit('error', { message: 'Sadece lobi sahibi manuel sayı çekebilir!' });
        return;
      }
      
      // Lobi bilgisini getir
      let lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
        ]
      });
      
      if (!lobby) {
        socket.emit('error', { message: 'Lobi bulunamadı!' });
        return;
      }
      
      // Yeni sayı çek
      const nextNumber = getRandomNumber(lobby.drawnNumbers || []);
      
      if (!nextNumber) {
        socket.emit('error', { message: 'Tüm sayılar çekildi!' });
        return;
      }
      
      // Yeni çekilen sayıyı ekle
      if (!lobby.drawnNumbers) {
        lobby.drawnNumbers = [];
      }
      
      lobby.drawnNumbers.push(nextNumber);
      lobby.currentNumber = nextNumber;
      
      // Duraklatma ve otomatik çekme durumları
      const newPausedState = !keepPausedState ? isManualDraw : lobby.isPaused || false;
      const autoDrawEnabled = keepAutoDrawState ? (lobby.autoDrawEnabled !== undefined ? lobby.autoDrawEnabled : true) : !isManualDraw;
      
      // Manuel çekme ve otomatik çekme durumunu koruma isteği var, autoDrawEnabled durumu değiştirilmiyor
      if (isManualDraw && keepAutoDrawState) {
        console.log('Manuel çekme ve otomatik çekme durumunu koruma isteği var, autoDrawEnabled durumu değiştirilmiyor');
      } else {
        // Aksi halde otomatik çekme durumu tam tersine çevrilir (manuel çekme için false yapılır)
        lobby.autoDrawEnabled = autoDrawEnabled;
      }
      
      // Duraklatma durumunu güncelle
      lobby.isPaused = newPausedState;
      
      // Değişiklikleri kaydet
      lobby.markModified('drawnNumbers');
      await lobby.save();
      
      console.log(`Lobi başarıyla kaydedildi. Güncel çekilen sayı adedi: ${lobby.drawnNumbers.length}/90`);
      
      // Sayı çekildiğinde, geri sayım sayacını yeniden başlat
      // Eğer oyun duraklatılmışsa, sayaç sabit kalacak
      const gameSpeed = lobby.settings?.gameSpeed || 'normal';
      const countdownDuration = getCountdownDuration(gameSpeed);
      
      if (!newPausedState) {
        console.log(`Sayaç başlatılıyor: Lobi=${lobbyId}, Süre=${countdownDuration}, Hız=${gameSpeed}`);
        startCountdown(lobbyId, gameSpeed, newPausedState);
      }
      
      // Socket.io ile herkese bildir
      io.to(lobbyId).emit('number_drawn', {
        number: nextNumber,
        drawnNumbers: lobby.drawnNumbers,
        isPaused: newPausedState,
        autoDrawEnabled: autoDrawEnabled,
        countdown: countdownDuration,
        timestamp: Date.now()
      });
      
      console.log(`Yeni sayı çekildi: ${nextNumber} - Toplam: ${lobby.drawnNumbers.length}/90`);
      
      // Sayı çekildikten sonra botların hamlelerini kontrol et
      setTimeout(async () => {
        try {
          const updatedLobby = await Lobby.findOne({
            $or: [
              { lobbyCode: lobbyId },
              { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
            ]
          });
          
          if (updatedLobby) {
            console.log(`Bot hareketleri kontrol ediliyor (Lobi: ${lobbyId}, Çekilen sayı: ${nextNumber})`);
            await processBotMoves(updatedLobby);
          }
        } catch (botError) {
          console.error(`Bot hareketleri işlenirken hata: ${botError.message}`);
        }
      }, 1500); // 1.5 saniye sonra bot hareketlerini kontrol et
    } catch (error) {
      console.error('Sayı çekme hatası:', error);
      socket.emit('error', { message: 'Sayı çekme işlemi sırasında bir hata oluştu' });
    }
  });
  
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

  // Sayaç durumunu sorgulama - yeni eklenen olay
  socket.on('get_countdown', async (data) => {
    try {
      const { lobbyId } = data;
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        return;
      }
      
      // Lobi için sayaç bilgilerini al
      const countdownInfo = lobbyCountdowns.get(lobbyId);
      
      if (countdownInfo) {
        // Sayaç bilgilerini gönder
        socket.emit('countdown_update', {
          countdown: countdownInfo.countdown,
          lobbyId,
          isPaused: countdownInfo.isPaused,
          timestamp: Date.now()
        });
      } else {
        // Lobi bilgilerini al
        const lobby = await Lobby.findOne({ 
          $or: [
            { lobbyCode: lobbyId }, 
            { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
          ]
        });
        
        if (!lobby) {
          socket.emit('error', { message: 'Lobi bulunamadı' });
          return;
        }
        
        // Oyun durumuna göre yanıt ver
        if (lobby.status === 'playing') {
          // Oyun devam ediyor ama sayaç yok, yeni sayaç başlat
          const countdown = startCountdown(lobbyId, lobby.gameSpeed || 'normal', lobby.isPaused || false);
          
          socket.emit('countdown_update', {
            countdown,
            lobbyId,
            isPaused: lobby.isPaused || false,
            timestamp: Date.now()
          });
        } else {
          // Oyun başlamamış veya bitmiş
          socket.emit('countdown_update', {
            countdown: getCountdownDuration(lobby.gameSpeed || 'normal'),
            lobbyId,
            isPaused: true,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      console.error('Sayaç bilgisi alma hatası:', error);
      socket.emit('error', { message: 'Sayaç bilgisi alınırken bir hata oluştu' });
    }
  });
  
  // Socket eventleri
  socket.on('draw_number', async (data) => {
    try {
      console.log(`Sayı çekme isteği alındı: ${JSON.stringify(data)}`);
      const { lobbyId, playerId, isManualDraw, keepPausedState, keepAutoDrawState, manualDrawPermission } = data;
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        console.error('Sayı çekme isteğinde Lobi ID eksik');
        return;
      }
      
      // Lobi bilgilerini al
      const lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
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
      
      // Manuel sayı çekme yetkisi kontrolü
      if (isManualDraw) {
        // Lobideki ayarlara göre izin kontrolü yap
        const lobbyManualDrawPermission = lobby.settings?.manualNumberDrawPermission || lobby.manualNumberDrawPermission || 'host-only';
        
        // Oyuncunun host olup olmadığını kontrol et
        const isPlayerHost = lobby.creator.toString() === playerId || 
                            (Array.isArray(lobby.playersDetail) && 
                             lobby.playersDetail.find(p => p.id === playerId && p.isHost === true));

        console.log(`Manuel sayı çekme kontrolü - Client ayarı: ${manualDrawPermission}, Lobi ayarı: ${lobbyManualDrawPermission}, IsHost: ${isPlayerHost}`);
        
        // Eğer 'host-only' ise ve kullanıcı host değilse, engelle
        if (lobbyManualDrawPermission === 'host-only' && !isPlayerHost) {
          socket.emit('error', { message: 'Sadece lobi sahibi manuel olarak sayı çekebilir' });
          console.error(`Manuel sayı çekme yetkisi yok. Player: ${playerId}, Host: ${lobby.creator}`);
          return;
        }
        
        console.log(`Manuel sayı çekme yetkisi onaylandı. İzin ayarı: ${lobbyManualDrawPermission}, IsHost: ${isPlayerHost}`);
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
        
        // Manuel sayı çekme durumunu kontrol et
        const isManualDrawRequest = isManualDraw === true;
        const shouldKeepPausedState = keepPausedState === true;
        
        console.log(`Manuel çekme: ${isManualDrawRequest}, Duraklatma durumunu koru: ${shouldKeepPausedState}`);
        
        // Sayacı yeniden başlat - manuel sayı çekme durumunda
        const countdownDuration = getCountdownDuration(lobby.gameSpeed || 'normal');
        
        // Mevcut sayaç bilgilerini al
        const countdownInfo = lobbyCountdowns.get(lobbyId);
        
        // Duraklatma durumunu belirle
        let newPausedState = lobby.isPaused;
        
        // Manuel çekme ve duraklatma durumunu koruma isteği varsa, isPaused durumunu değiştirme
        if (isManualDrawRequest && shouldKeepPausedState) {
          console.log('Manuel çekme ve duraklatma durumunu koruma isteği var, isPaused durumu değiştirilmiyor');
          // Duraklatma durumunu koru
        } else {
          // Normal davranış - sayı çekildiğinde duraklatma kaldırılır
          newPausedState = false;
          lobby.isPaused = false;
          await lobby.save();
        }
        
        if (countdownInfo) {
          // Sayacı yeniden başlat
          clearInterval(countdownInfo.interval);
          
          // Yeni sayaç başlat (eğer oyun duraklatılmamışsa veya manuel çekme değilse)
          if (!newPausedState) {
            startCountdown(lobbyId, lobby.gameSpeed || 'normal', false);
          } else {
            // Oyun duraklatılmışsa, sadece sayaç değerini güncelle
            lobbyCountdowns.set(lobbyId, {
              ...countdownInfo,
              countdown: countdownDuration,
              isPaused: true
            });
          }
        } else {
          // Sayaç yoksa yeni sayaç başlat
          startCountdown(lobbyId, lobby.gameSpeed || 'normal', newPausedState);
        }
              
        // Otomatik çekme durumunu belirleme
        let autoDrawEnabled = !newPausedState;
        
        // Otomatik çekme durumunu koruma isteği varsa
        if (isManualDrawRequest && keepAutoDrawState) {
          console.log('Manuel çekme ve otomatik çekme durumunu koruma isteği var, autoDrawEnabled durumu değiştirilmiyor');
          // Eğer duraklatılmışsa otomatik çekme de kapalı olmalı
          autoDrawEnabled = !newPausedState;
        }
              
        // Tüm oyunculara yeni sayıyı bildir - kaydettikten sonra bildir
        io.to(lobbyId).emit('number_drawn', {
          number: nextNumber,
          drawnNumbers: lobby.drawnNumbers,
          isPaused: newPausedState,
          autoDrawEnabled: autoDrawEnabled,
          countdown: countdownDuration,
          timestamp: Date.now()
        });
        
        console.log(`Yeni sayı çekildi: ${nextNumber} - Toplam: ${lobby.drawnNumbers.length}/90`);
        
        // Sayı çekildi, herkese bildir
        io.to(lobbyId).emit('number_drawn', {
          number: nextNumber,
          drawnNumbers: lobby.drawnNumbers,
          isPaused: newPausedState,
          autoDrawEnabled: autoDrawEnabled,
          countdown: countdownDuration,
          timestamp: Date.now()
        });
        
        // Sayı çekildikten sonra botların hamlelerini kontrol et
        if (lobby) {
          setTimeout(async () => {
            try {
              await processBotMoves(lobby);
            } catch (botError) {
              console.error('Bot hamleleri kontrol edilirken hata:', botError);
            }
          }, 1000); // 1 saniye sonra bot hareketlerini kontrol et
        }
        
        console.log(`Yeni sayı çekildi: ${nextNumber} - Toplam: ${lobby.drawnNumbers.length}/90`);
        
        // Bot hareketlerini işle - Sayı çekildikten sonra
        setTimeout(async () => {
          try {
            // Lobi bilgilerini tekrar al (güncel durumu almak için)
            const updatedLobby = await Lobby.findOne({ 
              $or: [
                { lobbyCode: lobbyId }, 
                { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
              ]
            });
            
            if (updatedLobby && updatedLobby.status === 'playing') {
              console.log(`Bot hareketleri işleniyor... Lobi=${lobbyId}, Son çekilen sayı=${nextNumber}`);
              await processBotMoves(updatedLobby);
            } else {
              console.log(`Bot hareketleri işlenmiyor, oyun durumu: ${updatedLobby?.status || 'bilinmiyor'}`);
            }
          } catch (botError) {
            console.error('Bot hareketleri işlenirken hata:', botError);
          }
        }, 2000); // Botlar için gerçekçi görünmesi için 2 saniye bekle
        
        // Tüm sayılar çekildiyse durumu güncelle
        if (lobby.drawnNumbers.length >= 90) {
          lobby.status = 'finished';
          await lobby.save();
          
          // Sayacı durdur
          stopCountdown(lobbyId);
          
          io.to(lobbyId).emit('game_end', { 
            message: 'Tüm sayılar çekildi, oyun bitti!',
            allNumbersDrawn: true
          });
          return;
        }
      } catch (saveError) {
        console.error('Lobi kaydedilirken hata:', saveError);
        socket.emit('error', { message: 'Lobi kaydedilirken hata oluştu' });
        return;
      }
      
      // Tüm sayılar çekildiyse durumu güncelle
      if (lobby.drawnNumbers.length >= 90) {
        lobby.status = 'finished';
                await lobby.save();
        
        // Sayacı durdur
        stopCountdown(lobbyId);
        
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
            { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
          ]
        }).populate({
          path: 'playersDetail.user',
          select: 'username profileImage'
        });
        
        if (lobby) {
          console.log(`Lobi bulundu: ${lobby.lobbyCode}`);
          
          // Creator ID string formatına çevir için yardımcı fonksiyon
          const normalizeId = (id) => {
            if (!id) return '';
            // Eğer bir ObjectId ise string'e çevir
            if (typeof id === 'object' && id._id) return id._id.toString();
            // Eğer zaten string ise
            if (typeof id === 'string') return id;
            // Diğer durumlar için toString uygula
            return id.toString();
          };

          // Creator ID'yi string olarak al
          const creatorIdStr = normalizeId(lobby.creator);
          const playerIdStr = normalizeId(playerId);
          
          console.log(`Lobi creator ID: ${creatorIdStr}`);
          console.log(`Oyuncu ID: ${playerIdStr}`);
          
          // Mevcut oyuncunun host olup olmadığını kontrol et
          // Tam eşleşme veya ID içinde bulunma durumunu kontrol et
          const isCurrentPlayerHost = creatorIdStr === playerIdStr || 
            (creatorIdStr.includes(playerIdStr) && playerIdStr.length > 5) ||
            (playerIdStr.includes(creatorIdStr) && creatorIdStr.length > 5);
            
          console.log(`Oyuncu ${playerId} host mu: ${isCurrentPlayerHost} (geliştirilmiş kontrol)`);
          
          // Host bilgisini socket mapping'e kaydet
          if (socketMap[socket.id]) {
            socketMap[socket.id].isHost = isCurrentPlayerHost;
          } else {
            socketMap[socket.id] = {
              playerId,
              lobbyId,
              isHost: isCurrentPlayerHost
            };
          }
          
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
            const playerUserId = normalizeId(player.user);
            
            // Her oyuncu için host kontrolü yap
            const isHostPlayer = playerUserId === creatorIdStr || 
              (playerUserId.includes(creatorIdStr) && creatorIdStr.length > 5) ||
              (creatorIdStr.includes(playerUserId) && playerUserId.length > 5);
            
            return {
              id: playerUserId,
              name: player.name || (userProfile ? userProfile.username : 'Bilinmeyen Oyuncu'),
              isBot: player.isBot || false,
              isHost: isHostPlayer, // Geliştirilmiş host kontrolü
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
            players: enrichedPlayers,
            isHost: isCurrentPlayerHost, // Doğrudan katılan oyuncuya host durumunu bildir
            lobby: {
              _id: lobby._id,
              name: lobby.name,
              game: lobby.game,
              creator: lobby.creator,
              maxPlayers: lobby.maxPlayers,
              status: lobby.status
            }
          });
          
          // Diğer oyunculara bildir
          socket.to(lobbyId).emit('player_joined', {
            playerId,
            playerName: realPlayerName || 'Yeni Oyuncu',
            players: enrichedPlayers,
            message: `${realPlayerName || 'Yeni oyuncu'} lobiye katıldı`
          });
              } else {
          console.error(`Lobi bulunamadı: ${lobbyId}`);
          socket.emit('error', { message: 'Lobi bulunamadı' });
        }
      } catch (error) {
        console.error('Lobiye katılırken hata:', error);
        socket.emit('error', { message: 'Lobiye katılırken bir hata oluştu' });
      }
    } catch (error) {
      console.error('Lobiye katılma hatası:', error);
      socket.emit('error', { message: 'İşlem sırasında bir hata oluştu' });
    }
  });
  
  // Oyun başlatma olayı
  socket.on('game_start', async (data) => {
    try {
      console.log(`Oyun başlatma isteği alındı: ${JSON.stringify(data)}`);
      const { lobbyId, newGame } = data;
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        return;
        }
        
      // İstek yapan kullanıcı host mu kontrol et
      const requesterId = socketMap[socket.id]?.playerId;
      const isHost = socketMap[socket.id]?.isHost || false;
      
      if (!isHost) {
        console.warn(`Host olmayan kullanıcı oyunu başlatmaya çalıştı: ${requesterId}`);
        socket.emit('error', { message: 'Sadece lobi sahibi oyunu başlatabilir!' });
        return;
      }
      
      // Lobi bilgilerini al
      const lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
        ]
      });
      
      if (!lobby) {
        socket.emit('error', { message: 'Lobi bulunamadı' });
        console.error(`Lobi bulunamadı: ${lobbyId}`);
        return;
      }
      
      // Yeni oyun mu yoksa devam eden bir oyun mu kontrol et
      if (newGame) {
        console.log(`Yeni oyun başlatılıyor: ${lobbyId}`);
        
        // Önceki oyun verilerini temizle
              lobby.drawnNumbers = [];
              lobby.currentNumber = null;
          lobby.winners = [];
        lobby.isPaused = false;
      }
      
      // Oyun durumunu güncelle
      lobby.status = 'playing';
      lobby.startedAt = new Date();
      
      // Veritabanına kaydet
      await lobby.save();
      
      console.log(`Lobi durumu güncellendi: ${lobby.lobbyCode}, Yeni durum: ${lobby.status}`);
      
      // Sayacı başlat
      startCountdown(lobbyId, lobby.gameSpeed || 'normal', false);
      
      // Tüm oyunculara bildir
      io.to(lobbyId).emit('game_start', {
        gameStatus: 'playing',
        message: data.message || 'Oyun başladı!',
        drawnNumbers: lobby.drawnNumbers || [],
        currentNumber: lobby.currentNumber,
        isPaused: false,
        autoDrawEnabled: true,
        countdown: getCountdownDuration(lobby.gameSpeed || 'normal'),
        timestamp: Date.now()
      });
      
      // Bot oyuncuları kontrol et ve kart oluştur
      const bots = lobby.playersDetail.filter(player => player.isBot === true);
      if (bots.length > 0) {
        console.log(`Lobide ${bots.length} bot var, kartları oluşturuluyor...`);
        try {
          const result = await createAndSaveBotCards(lobby);
          
          if (result.success) {
            console.log(result.message);
            if (result.lobby) {
              lobby = result.lobby; // Güncellenmiş lobi bilgilerini kullan
            }
          } else {
            console.error('Bot kartları oluşturulamadı:', result.message);
          }
        } catch (error) {
          console.error('Bot kartları oluşturulurken hata:', error);
        }
          
        // Belirli bir süre sonra bot hareketlerini işlemeye başla
        setTimeout(async () => {
          try {
            // Güncel lobi bilgilerini al
            const updatedLobby = await Lobby.findOne({ 
              $or: [
                { lobbyCode: lobbyId }, 
                { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
              ]
            });
            
            // Oyun başladığında botların hareketlerini tetikle (ilk sayı çekildiğinde)
            if (updatedLobby && updatedLobby.status === 'playing' && updatedLobby.drawnNumbers && updatedLobby.drawnNumbers.length > 0) {
              console.log(`Bot hareketleri işleniyor... Oyun başlangıcı: Lobi=${lobbyId}`);
              await processBotMoves(updatedLobby);
            } else {
              console.log(`Bot hareketleri işlenmedi: Lobi durumu=${updatedLobby?.status}, Çekilen sayı sayısı=${updatedLobby?.drawnNumbers?.length || 0}`);
            }
          } catch (botError) {
            console.error('Bot hareketleri işlenirken hata:', botError);
          }
        }, 5000); // Oyun başladıktan 5 saniye sonra bot hareketlerini işle
      }
      
    } catch (error) {
      console.error('Oyun başlatma hatası:', error);
      socket.emit('error', { message: 'Oyun başlatılırken bir hata oluştu' });
    }
  });

  // Oyun durumu güncelleme olayı (pause/resume)
  socket.on('game_update', async (data) => {
    try {
      const { lobbyId, isPaused } = data;
      console.log(`Oyun durumu güncelleme isteği: ${lobbyId}, isPaused: ${isPaused}`);
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        return;
      }
      
      // İstek yapan kullanıcı host mu kontrol et
      const requesterId = socketMap[socket.id]?.playerId;
      const isHost = socketMap[socket.id]?.isHost || false;
      
      if (!isHost) {
        console.warn(`Host olmayan kullanıcı oyun durumunu değiştirmeye çalıştı: ${requesterId}`);
        socket.emit('error', { message: 'Sadece lobi sahibi oyun durumunu değiştirebilir!' });
        return;
      }
      
      // Lobi bilgilerini al
      const lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
        ]
      });
      
      if (!lobby) {
        socket.emit('error', { message: 'Lobi bulunamadı' });
        console.error(`Lobi bulunamadı: ${lobbyId}`);
        return;
      }
      
      // Oyun başlamış mı kontrol et
      if (lobby.status !== 'playing') {
        socket.emit('error', { message: 'Oyun başlamadı, durum değiştirilemez' });
        console.error(`Oyun başlamadı, durum değiştirilemez. Mevcut durum: ${lobby.status}`);
        return;
      }
      
      // Duraklatma durumunu güncelle
      lobby.isPaused = isPaused;
      
      // Veritabanına kaydet
      await lobby.save();
      console.log(`Lobi durumu güncellendi: ${lobby.lobbyCode}, isPaused: ${isPaused}`);
      
      // Sayaç durumunu güncelle
      toggleCountdown(lobbyId, isPaused);
      
      // Oyun hızına göre sayaç süresini belirle
      const countdownDuration = getCountdownDuration(lobby.gameSpeed);
    
    // Tüm oyunculara bildir
      io.to(lobbyId).emit('game_status_changed', {
        isPaused,
        gameStatus: lobby.status,
        message: isPaused ? 'Oyun duraklatıldı' : 'Oyun devam ediyor',
        timestamp: Date.now(),
        countdown: countdownDuration, // Sayaç süresini gönder
        autoDrawEnabled: !isPaused // Otomatik çekme durumunu da gönder
      });
      
    } catch (error) {
      console.error('Oyun durumu güncelleme hatası:', error);
      socket.emit('error', { message: 'Oyun durumu güncellenirken bir hata oluştu' });
    }
  });

  // Bağlantı kesildiğinde
  socket.on('disconnect', (reason) => {
    console.log(`Socket bağlantısı kesildi (${socket.id}): ${reason}`);
  });
  
  // Tombala talep etme olayı
  socket.on('claim_tombala', async (data) => {
    try {
      const { lobbyId, playerId, playerName, cardIndex = 0 } = data;
      console.log(`Tombala talebi alındı: Lobi=${lobbyId}, Oyuncu=${playerId || playerName}`);
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        return;
      }
      
      // handleTombalaClaim fonksiyonu ile talebi işle
      const result = await handleTombalaClaim({
        lobbyId,
                  playerId,
        cardIndex,
        isBot: false // Oyuncu tarafından yapılan talep
      }, io);
      
      // Sonucu client'a bildir
      if (result.success) {
        console.log(`Tombala talebi başarılı: ${result.playerName}`);
        socket.emit('success', { 
          message: 'Tombala başarıyla talep edildi',
          type: 'tombala'
        });
      } else {
        console.log(`Tombala talebi başarısız: ${result.message}`);
        socket.emit('error', { 
          message: result.message
      });
      }
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
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
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
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
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

  // Lobi ayarlarını güncelleme olayı
  socket.on('update_lobby_settings', async (data) => {
    try {
      const { lobbyId, settings } = data;
      console.log(`Lobi ayarları güncelleme isteği: ${lobbyId}`, settings);
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        return;
      }
      
      // İstek yapan kullanıcı host mu kontrol et
      const requesterId = socketMap[socket.id]?.playerId;
      const isHost = socketMap[socket.id]?.isHost || false;
      
      if (!isHost) {
        console.warn(`Host olmayan kullanıcı lobi ayarlarını değiştirmeye çalıştı: ${requesterId}`);
        socket.emit('error', { message: 'Sadece lobi sahibi ayarları değiştirebilir!' });
        return;
      }
      
      // Lobi bilgilerini al
      const lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
        ]
      });
      
      if (!lobby) {
        socket.emit('error', { message: 'Lobi bulunamadı' });
        console.error(`Lobi bulunamadı: ${lobbyId}`);
        return;
      }
      
      // Ayarları güncelle
      if (settings.manualNumberDrawPermission !== undefined) {
        lobby.manualNumberDrawPermission = settings.manualNumberDrawPermission;
      }
      
      // Diğer ayarlar da eklenebilir
      if (settings.gameSpeed !== undefined) {
        lobby.gameSpeed = settings.gameSpeed;
      }
      
      if (settings.enableMusic !== undefined) {
        lobby.enableMusic = settings.enableMusic;
      }
      
      // Değişiklikleri kaydet
      await lobby.save();
      
      // Tüm kullanıcılara ayarların güncellendiğini bildir
      io.to(lobbyId).emit('lobby_settings_updated', {
        lobbyId,
        settings: {
          manualNumberDrawPermission: lobby.manualNumberDrawPermission,
          gameSpeed: lobby.gameSpeed,
          enableMusic: lobby.enableMusic
        },
        updatedBy: requesterId
      });
      
      console.log(`Lobi ayarları güncellendi: ${lobbyId}`);
    } catch (error) {
      console.error('Lobi ayarları güncelleme hatası:', error);
      socket.emit('error', { message: 'Ayarlar güncellenirken bir hata oluştu' });
    }
  });

  // Oyun durumu güncelleme olayı (pause/resume)
  socket.on('game_update', async (data) => {
    try {
      const { lobbyId, isPaused } = data;
      console.log(`Oyun durumu güncelleme isteği: ${lobbyId}, isPaused: ${isPaused}`);
      
      if (!lobbyId) {
        socket.emit('error', { message: 'Lobi ID gerekli' });
        return;
      }
      
      // İstek yapan kullanıcı host mu kontrol et
      const requesterId = socketMap[socket.id]?.playerId;
      const isHost = socketMap[socket.id]?.isHost || false;
      
      if (!isHost) {
        console.warn(`Host olmayan kullanıcı oyun durumunu değiştirmeye çalıştı: ${requesterId}`);
        socket.emit('error', { message: 'Sadece lobi sahibi oyun durumunu değiştirebilir!' });
        return;
      }
      
      // Lobi bilgilerini al
      const lobby = await Lobby.findOne({ 
        $or: [
          { lobbyCode: lobbyId }, 
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
        ]
      });
      
      if (!lobby) {
        socket.emit('error', { message: 'Lobi bulunamadı' });
        console.error(`Lobi bulunamadı: ${lobbyId}`);
        return;
      }
      
      // Oyun başlamış mı kontrol et
      if (lobby.status !== 'playing') {
        socket.emit('error', { message: 'Oyun başlamadı, durum değiştirilemez' });
        console.error(`Oyun başlamadı, durum değiştirilemez. Mevcut durum: ${lobby.status}`);
        return;
      }
      
      // Duraklatma durumunu güncelle
      lobby.isPaused = isPaused;
      
      // Veritabanına kaydet
      await lobby.save();
      console.log(`Lobi durumu güncellendi: ${lobby.lobbyCode}, isPaused: ${isPaused}`);
      
      // Sayaç durumunu güncelle
      toggleCountdown(lobbyId, isPaused);
      
      // Oyun hızına göre sayaç süresini belirle
      const countdownDuration = getCountdownDuration(lobby.gameSpeed);
      
      // Tüm oyunculara bildir
      io.to(lobbyId).emit('game_status_changed', {
        isPaused,
        gameStatus: lobby.status,
        message: isPaused ? 'Oyun duraklatıldı' : 'Oyun devam ediyor',
        timestamp: Date.now(),
        countdown: countdownDuration, // Sayaç süresini gönder
        autoDrawEnabled: !isPaused // Otomatik çekme durumunu da gönder
      });
      
    } catch (error) {
      console.error('Oyun durumu güncelleme hatası:', error);
      socket.emit('error', { message: 'Oyun durumu güncellenirken bir hata oluştu' });
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
          { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null },
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
        { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
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

// Bot kartlarını oluştur ve kaydet
const createAndSaveBotCards = async (lobby) => {
  try {
    if (!lobby || !lobby.playersDetail) {
      console.log('Lobi bilgileri yok, bot kartları oluşturulamadı');
      return { success: false, message: 'Lobi bilgileri eksik' };
    }
    
    // Tüm botları filtrele
    const bots = lobby.playersDetail.filter(player => player.isBot === true);
    if (bots.length === 0) {
      console.log('Lobide bot yok, kartlar oluşturulmadı');
      return { success: true, message: 'Lobide bot yok', botCount: 0 };
    }
    
    let cardsCreated = false;
    
    // Her bot için kartları oluştur
    for (const bot of bots) {
      if (!bot.cards || !Array.isArray(bot.cards) || bot.cards.length === 0) {
        bot.cards = generateTombalaCards(1);
        console.log(`Bot ${bot.name} için kartlar oluşturuldu`);
        cardsCreated = true;
      }
    }
    
    // Kartlar oluşturulduysa veritabanına kaydet
    if (cardsCreated) {
      lobby.markModified('playersDetail');
      await lobby.save();
      console.log(`${bots.length} bot için kartlar başarıyla kaydedildi`);
      
      // Güncel lobi bilgilerini al
      const updatedLobby = await Lobby.findById(lobby._id);
      return { 
        success: true, 
        message: 'Bot kartları oluşturuldu ve kaydedildi', 
        botCount: bots.length,
        lobby: updatedLobby || lobby
      };
    }
    
    return { 
      success: true, 
      message: 'Tüm botların zaten kartları var', 
      botCount: bots.length,
      lobby: lobby
    };
  } catch (error) {
    console.error('Bot kartları oluşturulurken hata:', error);
    return { success: false, message: error.message, error };
  }
};
