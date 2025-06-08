
// Tombala talebi işleme fonksiyonu
const handleTombalaClaim = async (data, socketIo) => {
  try {
    const { lobbyId, playerId, cardIndex, isBot = false } = data;
    
    console.log(`Tombala talebi: Lobi=${lobbyId}, Oyuncu=${playerId}, Kart=${cardIndex}, Bot=${isBot}`);
    
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
      // Bot için direkt ID ile eşleştir
      playerDetail = lobby.playersDetail.find(p => p._id && p._id.toString() === playerId.toString());
      console.log(`Bot oyuncu detayı: ${playerDetail ? 'Bulundu' : 'Bulunamadı'}, Bot ID: ${playerId}`);
    } else {
      // Normal oyuncu için user alanı ile eşleştir
      playerDetail = lobby.playersDetail.find(p => p.user && p.user.toString() === playerId.toString());
      console.log(`Normal oyuncu detayı: ${playerDetail ? 'Bulundu' : 'Bulunamadı'}, Oyuncu ID: ${playerId}`);
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

// =====================================================================
// 2. processBotMoves fonksiyonunu düzeltin
// =====================================================================

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
    
    // Lobi ID'sini string'e çevir
    const lobbyId = lobby._id.toString();
    
    // Her bot için hamleleri kontrol et
    for (const bot of bots) {
      // Bot için kart yoksa oluştur
      if (!bot.cards || !Array.isArray(bot.cards) || bot.cards.length === 0) {
        // Kartları oluştur
        bot.cards = botHelpers.createBotCards();
        console.log(`Bot ${bot.name} için kartlar oluşturuldu`);
        
        // Mongo için değişiklikleri işaretle
        lobby.markModified('playersDetail');
        await lobby.save();
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
              await botHelpers.makeBotMove(bot, lobby);
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

// =====================================================================
// 3. Uygulanması gereken önemli değişiklikler (socket.on olayları)
// =====================================================================

// Aşağıdaki kodu socket.on('claim_tombala') olayına eklenmeli
socket.on('claim_tombala', async (data) => {
  try {
    const { lobbyId, playerId, playerName, cardIndex } = data;
    console.log(`Tombala talebi alındı: Lobi=${lobbyId}, Oyuncu=${playerId || playerName}`);
    
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

// =====================================================================
// 4. Sayı çekildikten sonra bot hamlelerini kontrol etmek için değişiklik
// =====================================================================

// Sayı çekildikten sonra botların hamlelerini kontrol et (socket.on draw_number'dan sonra)
setTimeout(async () => {
  try {
    const updatedLobby = await Lobby.findOne({
      $or: [
        { lobbyCode: lobbyId },
        { _id: mongoose.Types.ObjectId.isValid(lobbyId) ? new mongoose.Types.ObjectId(lobbyId) : null }
      ]
    });
    
    if (updatedLobby && updatedLobby.status === 'playing') {
      console.log(`Bot hamleleri kontrol ediliyor (Lobi: ${lobbyId}, Çekilen sayı: ${nextNumber})`);
      await processBotMoves(updatedLobby);
    }
  } catch (botError) {
    console.error(`Bot hamleleri işlenirken hata: ${botError.message}`);
  }
}, 1500); // 1.5 saniye sonra bot hareketlerini kontrol et


