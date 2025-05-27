// TombalaCard.jsx için düzenleme -- sadece son çekilen sayı işaretlenebilir kısıtlaması
const handleCellClick = (number, rowIndex, colIndex) => {
  // Eğer sayı geçerli değilse işlem yapma
  if (!number) return;
  
  // İlk kontrol: Sayı çekilmiş mi?
  if (!drawnNumbers.includes(number)) {
    console.log(`Sayı ${number} henüz çekilmemiş, işaretlenemez`);
    setOpenAlert(true);
    return;
  }
  
  // İkinci kontrol: Sadece en son çekilen sayıyı işaretlemeye izin ver
  if (number !== currentNumber) {
    // Eğer tıklanan sayı son çekilen sayı değilse uyarı göster
    console.log(`Sayı ${number} son çekilen sayı (${currentNumber}) değil, işaretlenemez`);
    setOpenAlert(true);
    return; 
  }
  
  console.log(`Sayı ${number} işaretleniyor - Son çekilen sayı ile eşleşiyor`);
  // Devam eder...
};

// Server.js - Sayı çekildikten sonra botların hamle yapabilmesi için kod
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
      console.log(`Bot hamleleri kontrol ediliyor (Lobi: ${lobbyId}, Çekilen sayı: ${nextNumber})`);
      await processBotMoves(updatedLobby);
    }
  } catch (botError) {
    console.error(`Bot hamleleri işlenirken hata: ${botError.message}`);
  }
}, 1500);

// Bot hareketi ile ilgili debug bilgileri
const botMove = {
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
  }
};


