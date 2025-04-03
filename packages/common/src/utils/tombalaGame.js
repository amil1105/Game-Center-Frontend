/**
 * Tombala oyununun temel mantığını yöneten yardımcı fonksiyonlar
 */

import seedrandom from 'seedrandom';

/**
 * Başlangıç oyun durumunu oluştur
 * @param {object} options - Oyun seçenekleri
 * @returns {object} Başlangıç oyun durumu
 */
export const createInitialGameState = (options = {}) => {
  const gameSeed = options.seed || `game_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  
  return {
    id: options.id || `game_${Date.now()}`,
    status: 'waiting',
    drawnNumbers: [],
    currentNumber: null,
    players: options.players || [],
    winner: null,
    winType: null,
    prize: options.prize || 0,
    startTime: null,
    endTime: null,
    gameSeed: gameSeed
  };
};

/**
 * Oyun durumunu güncelle
 * @param {object} prevState - Önceki oyun durumu
 * @param {object} updates - Güncellenecek alanlar
 * @returns {object} Güncellenmiş oyun durumu
 */
export const updateGameState = (prevState, updates) => {
  if (!prevState) {
    return createInitialGameState(updates);
  }
  
  return {
    ...prevState,
    ...updates,
    players: updates.players || prevState.players,
    // Eğer oyun bitti durumuna geçiliyorsa endTime ekle
    ...(updates.status === 'finished' && !prevState.endTime ? { endTime: new Date().toISOString() } : {}),
    // Eğer oyun başladı durumuna geçiliyorsa startTime ekle
    ...(updates.status === 'playing' && !prevState.startTime ? { startTime: new Date().toISOString() } : {})
  };
};

/**
 * Demo oyuncular oluştur (test ve geliştirme için)
 * @param {number} count - Oluşturulacak oyuncu sayısı
 * @param {number} botCount - Oluşturulacak bot sayısı 
 * @param {object} options - Ek seçenekler
 * @returns {array} Oyuncu listesi
 */
export const createDemoPlayers = (count = 1, botCount = 3, options = {}) => {
  const players = [];
  const currentPlayerId = options.currentPlayerId || 'player_1';
  
  // Gerçek oyuncular
  for (let i = 1; i <= count; i++) {
    const playerId = `player_${i}`;
    
    players.push({
      id: playerId,
      name: i === 1 ? 'Siz' : `Oyuncu ${i}`,
      betAmount: options.betAmount || 10,
      status: null,
      isCurrentPlayer: playerId === currentPlayerId
    });
  }
  
  // Bot oyuncular
  for (let i = 1; i <= botCount; i++) {
    const botId = `bot_${i}`;
    const difficulty = ['easy', 'normal', 'hard'][Math.floor(Math.random() * 3)];
    
    players.push({
      id: botId,
      name: getRandomBotName(),
      betAmount: options.botBetAmount || 10,
      status: null,
      isBot: true,
      difficultyLevel: difficulty
    });
  }
  
  return players;
};

/**
 * Rastgele bir Türkçe bot ismi döndür
 * @returns {string} Rastgele bot ismi
 */
export const getRandomBotName = () => {
  const turkishNames = [
    'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Mustafa', 
    'Ali', 'Zeynep', 'Hüseyin', 'Emine', 'İbrahim',
    'Hatice', 'Osman', 'Elif', 'Hasan', 'Meryem',
    'Can', 'Esra', 'Murat', 'Deniz', 'Ömer',
    'Sevgi', 'Kemal', 'Sibel', 'Yusuf', 'Gül',
    'Emre', 'Aslı', 'Burak', 'Seda', 'Cem'
  ];
  
  return turkishNames[Math.floor(Math.random() * turkishNames.length)];
};

/**
 * Bot zorluk seviyesine göre gecikme süresi belirle
 * @param {string} difficulty - Bot zorluk seviyesi (easy, normal, hard)
 * @returns {number} Milisaniye cinsinden gecikme süresi
 */
export const getBotDelayByDifficulty = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      // Kolay botlar 1.5-3 saniye arası bekler
      return 1500 + Math.random() * 1500;
    case 'normal':
      // Normal botlar 0.7-1.5 saniye arası bekler
      return 700 + Math.random() * 800;
    case 'hard':
      // Zor botlar 0.3-0.7 saniye arası bekler
      return 300 + Math.random() * 400;
    default:
      // Varsayılan olarak normal seviye
      return 1000 + Math.random() * 1000;
  }
};

/**
 * Bot oyuncu oluştur
 * @param {object} options - Bot özellikleri
 * @returns {object} Bot oyuncu objesi
 */
export const createBotPlayer = (options = {}) => {
  const botId = options.id || `bot_${Date.now()}`;
  const difficulty = options.difficulty || ['easy', 'normal', 'hard'][Math.floor(Math.random() * 3)];
  
  return {
    id: botId,
    name: options.name || getRandomBotName(),
    betAmount: options.betAmount || 10,
    status: null,
    isBot: true,
    difficultyLevel: difficulty,
    // Her bot için farklı bir seed üret
    seed: options.seed || `bot_${Math.random().toString(36).substring(2, 9)}`
  };
};

/**
 * Bütün bot oyuncular için işlemler yap
 * @param {array} botPlayers - Bot oyuncular listesi
 * @param {array} cards - Oyun kartları
 * @param {array} drawnNumbers - Çekilmiş sayılar
 * @param {number} currentNumber - Şu anki çekilen sayı
 * @returns {array} Bot eylemleri
 */
export const processBotPlayers = (botPlayers, cards, drawnNumbers, currentNumber) => {
  const actions = [];
  
  if (!botPlayers || !Array.isArray(botPlayers) || botPlayers.length === 0) {
    return actions;
  }
  
  botPlayers.forEach(bot => {
    // Bot için kart bul veya oluştur
    const botCard = cards.find(card => card.id === `${bot.id}_card`) || {
      id: `${bot.id}_card`,
      numbers: Array(3).fill().map(() => Array(9).fill(null)),
      marked: []
    };
    
    // Bot zorluk seviyesine göre gecikme hesapla
    const delay = getBotDelayByDifficulty(bot.difficultyLevel);
    
    // Çekilen numaranın kart üzerinde olup olmadığını kontrol et
    const hasNumber = botCard.numbers.some(row => 
      row.some(num => num === currentNumber)
    );
    
    if (hasNumber) {
      // Bot numarayı işaretler
      actions.push({
        botId: bot.id,
        action: 'mark',
        number: currentNumber,
        delay
      });
      
      // İşaretlenen numaraları güncelle
      const updatedMarked = [...(botCard.marked || []), currentNumber];
      botCard.marked = updatedMarked;
      
      // Kazanma durumunu kontrol et
      const winResult = checkBotWinningCondition(botCard, updatedMarked);
      
      // Bot kazanma türüne göre çinko veya tombala talep eder mi?
      const claim = determineBotClaim(bot, winResult);
      
      if (claim) {
        actions.push({
          botId: bot.id,
          action: 'claim',
          claim,
          delay: delay + 500, // İşaretlemeden biraz sonra talep et
          winResult
        });
      }
    }
  });
  
  return actions;
};

/**
 * Bot'un kartındaki kazanma durumunu kontrol et
 * @param {object} card - Bot kartı
 * @param {array} markedNumbers - İşaretlenmiş sayılar
 * @returns {object} Kazanma durumları
 */
export const checkBotWinningCondition = (card, markedNumbers) => {
  if (!card || !markedNumbers) {
    return { cinko1: false, cinko2: false, tombala: false };
  }
  
  // Satırdaki tüm sayıların işaretlenip işaretlenmediğini kontrol et
  const rowsComplete = card.numbers.map(row => {
    const rowNumbers = row.filter(num => num !== null);
    return rowNumbers.every(num => markedNumbers.includes(num));
  });
  
  // Kazanma durumlarını belirle
  return {
    cinko1: rowsComplete.some(complete => complete),
    cinko2: rowsComplete.filter(complete => complete).length >= 2,
    tombala: rowsComplete.every(complete => complete)
  };
};

/**
 * Bot'un kazanma durumunu talep edip etmeyeceğini belirle
 * @param {object} bot - Bot oyuncu
 * @param {object} winResult - Kazanma durumları
 * @returns {object|null} Talep bilgisi veya null
 */
export const determineBotClaim = (bot, winResult) => {
  if (!bot || !winResult) return null;
  
  // Zorluk seviyesine göre talep etme olasılığı
  let claimProbability;
  
  switch (bot.difficultyLevel) {
    case 'easy':
      // Kolay botlar %80 olasılıkla talep eder
      claimProbability = 0.8;
      break;
    case 'normal':
      // Normal botlar %90 olasılıkla talep eder
      claimProbability = 0.9;
      break;
    case 'hard':
      // Zor botlar her zaman talep eder
      claimProbability = 1;
      break;
    default:
      claimProbability = 0.85;
  }
  
  // Random değer üreterek talep edip etmeyeceğine karar ver
  const random = Math.random();
  
  // Tombala, çinko2, çinko1 sırasında kontrol et
  if (winResult.tombala && random <= claimProbability) {
    return { type: 'tombala' };
  } else if (!winResult.tombala && winResult.cinko2 && random <= claimProbability) {
    return { type: 'cinko2' };
  } else if (!winResult.cinko2 && winResult.cinko1 && random <= claimProbability) {
    return { type: 'cinko1' };
  }
  
  return null;
};

/**
 * Kartları işle ve kazanma durumlarını kontrol et
 * @param {array} cards - Oyun kartları
 * @param {array} drawnNumbers - Çekilmiş sayılar
 * @param {number} lastDrawnNumber - Son çekilen sayı
 * @returns {object} İşlenen kartlar ve kazanma durumları
 */
export const processCards = (cards, drawnNumbers, lastDrawnNumber) => {
  if (!cards || !drawnNumbers) {
    return { processedCards: cards, winners: [] };
  }
  
  const winners = [];
  
  // Her kart için işlemleri yap
  const processedCards = cards.map(card => {
    // Kartta son çekilen sayı var mı kontrol et
    const hasNumber = card.numbers.some(row => 
      row.some(num => num === lastDrawnNumber)
    );
    
    if (hasNumber) {
      // İşaretlenen sayıları güncelle
      const updatedMarked = [...(card.marked || []), lastDrawnNumber];
      
      // Kazanma durumunu kontrol et
      const winResult = checkBotWinningCondition({ ...card, marked: updatedMarked }, updatedMarked);
      
      // Kazananları belirle
      if (winResult.tombala) {
        winners.push({ cardId: card.id, type: 'tombala' });
      } else if (winResult.cinko2) {
        winners.push({ cardId: card.id, type: 'cinko2' });
      } else if (winResult.cinko1) {
        winners.push({ cardId: card.id, type: 'cinko1' });
      }
      
      return {
        ...card,
        marked: updatedMarked
      };
    }
    
    return card;
  });
  
  return {
    processedCards,
    winners
  };
};

/**
 * Oyun sonuç özeti oluştur
 * @param {object} gameState - Oyun durumu
 * @returns {object} Oyun sonuç özeti
 */
export const createGameSummary = (gameState) => {
  if (!gameState) return null;
  
  const { players, winner, winType, prize, startTime, endTime, drawnNumbers } = gameState;
  
  // Toplam ödülü hesapla
  const totalBets = players.reduce((sum, player) => sum + (player.betAmount || 0), 0);
  const totalPrize = prize || totalBets;
  
  // Kazananın alacağı ödül
  let winnerPrize = totalPrize;
  
  // Çinko türüne göre ödül dağılımı
  if (winType === 'cinko1') {
    winnerPrize = totalPrize * 0.2; // İlk çinko toplam ödülün %20'sini alır
  } else if (winType === 'cinko2') {
    winnerPrize = totalPrize * 0.3; // İkinci çinko toplam ödülün %30'unu alır
  } else if (winType === 'tombala') {
    winnerPrize = totalPrize * 0.5; // Tombala toplam ödülün %50'sini alır
  }
  
  // Oyun süresi
  let duration = 0;
  if (startTime && endTime) {
    duration = new Date(endTime) - new Date(startTime);
  }
  
  return {
    id: gameState.id,
    date: new Date().toISOString(),
    winner,
    winType,
    totalPrize,
    winnerPrize,
    players: players.map(player => ({
      id: player.id,
      name: player.name,
      betAmount: player.betAmount,
      status: player.status,
      isBot: player.isBot || false
    })),
    duration,
    drawnNumbers,
    numbersCount: drawnNumbers.length
  };
}; 