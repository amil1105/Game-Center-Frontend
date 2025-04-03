import seedrandom from 'seedrandom';
import { socket } from '..';

/**
 * Tombala kartı oluştur
 * @returns {object} Tombala kartı objesi (9x3 matris)
 */
export const generateTombalaCard = () => {
  const numbers = [];
  const rows = 3;
  const cols = 9;
  
  // Her sütun için kullanılabilecek sayılar (1-90 arası)
  const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
  
  // Her bir satır için 5 sayı, 4 boş hücre olacak şekilde düzenleyelim
  for (let row = 0; row < rows; row++) {
    const rowNumbers = [];
    
    // Her sütun için 1-10 arası, 11-20 arası şeklinde sayılar seçelim
    for (let col = 0; col < cols; col++) {
      // O sütun için kullanılabilecek sayılar (örneğin 1. sütun için 1-9, 2. sütun için 10-19 ...)
      const colStart = col * 10 + 1;
      const colEnd = Math.min(colStart + 9, 90);
      
      // O sütundaki sayıları filtrele
      const colNumbers = availableNumbers.filter(n => n >= colStart && n <= colEnd);
      
      if (colNumbers.length > 0) {
        // Rastgele bir sayı seç
        const randomIndex = Math.floor(Math.random() * colNumbers.length);
        const selectedNumber = colNumbers[randomIndex];
        
        rowNumbers.push(selectedNumber);
        
        // Seçilen sayıyı kullanılabilir sayılardan çıkar
        const index = availableNumbers.indexOf(selectedNumber);
        if (index !== -1) {
          availableNumbers.splice(index, 1);
        }
      } else {
        rowNumbers.push(null); // Eğer o sütunda sayı kalmadıysa boş hücre
      }
    }
    
    numbers.push(rowNumbers);
  }
  
  // Her satırda rastgele 4 hücreyi boş hale getir (5 sayı kalacak şekilde)
  for (let row = 0; row < rows; row++) {
    const rowNumbers = numbers[row];
    const indices = Array.from({ length: cols }, (_, i) => i);
    
    // Rastgele 4 indeks seç ve o hücreleri boşalt
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * indices.length);
      const selectedIndex = indices[randomIndex];
      
      rowNumbers[selectedIndex] = null;
      indices.splice(randomIndex, 1);
    }
  }
  
  return numbers;
};

/**
 * Belirli bir seed ile tombala kartı oluştur (testler ve botlar için)
 * @param {string} seed - Rastgele sayı üreteci için başlangıç değeri
 * @returns {object} Tombala kartı objesi
 */
export const generateSeededTombalaCard = (seed) => {
  const rng = seedrandom(seed);
  const numbers = [];
  const rows = 3;
  const cols = 9;
  
  // Her sütun için kullanılabilecek sayılar (1-90 arası)
  const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
  
  // Her bir satır için 5 sayı, 4 boş hücre olacak şekilde düzenleyelim
  for (let row = 0; row < rows; row++) {
    const rowNumbers = [];
    
    // Her sütun için 1-10 arası, 11-20 arası şeklinde sayılar seçelim
    for (let col = 0; col < cols; col++) {
      // O sütun için kullanılabilecek sayılar
      const colStart = col * 10 + 1;
      const colEnd = Math.min(colStart + 9, 90);
      
      // O sütundaki sayıları filtrele
      const colNumbers = availableNumbers.filter(n => n >= colStart && n <= colEnd);
      
      if (colNumbers.length > 0) {
        // Seed ile rastgele bir sayı seç
        const randomIndex = Math.floor(rng() * colNumbers.length);
        const selectedNumber = colNumbers[randomIndex];
        
        rowNumbers.push(selectedNumber);
        
        // Seçilen sayıyı kullanılabilir sayılardan çıkar
        const index = availableNumbers.indexOf(selectedNumber);
        if (index !== -1) {
          availableNumbers.splice(index, 1);
        }
      } else {
        rowNumbers.push(null); // Eğer o sütunda sayı kalmadıysa boş hücre
      }
    }
    
    numbers.push(rowNumbers);
  }
  
  // Her satırda rastgele 4 hücreyi boş hale getir (5 sayı kalacak şekilde)
  for (let row = 0; row < rows; row++) {
    const rowNumbers = numbers[row];
    const indices = Array.from({ length: cols }, (_, i) => i);
    
    // Rastgele 4 indeks seç ve o hücreleri boşalt
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(rng() * indices.length);
      const selectedIndex = indices[randomIndex];
      
      rowNumbers[selectedIndex] = null;
      indices.splice(randomIndex, 1);
    }
  }
  
  return numbers;
};

/**
 * Tombala kartı için kazanma koşulunu kontrol et
 * @param {object} card - Kontrol edilecek tombala kartı
 * @param {array} markedNumbers - İşaretlenmiş sayılar
 * @param {string} winType - Kazanma tipi ('cinko1', 'cinko2', 'tombala')
 * @returns {boolean} Kazanma durumu
 */
export const checkWinningCondition = (card, markedNumbers, winType) => {
  if (!card || !markedNumbers || markedNumbers.length === 0) return false;
  
  // Kartı düzleştir ve boş olmayan sayıları al
  const flatNumbers = card.flat().filter(num => num !== null);
  
  // Tüm sayıların işaretlenip işaretlenmediğini kontrol et
  const allMarked = flatNumbers.every(num => markedNumbers.includes(num));
  
  // Tombala kontrolü (tüm sayılar işaretlenmiş mi?)
  if (winType === 'tombala') {
    return allMarked;
  }
  
  // Satır bazında kontrol et
  const rowsComplete = card.map(row => {
    const rowNumbers = row.filter(num => num !== null);
    return rowNumbers.every(num => markedNumbers.includes(num));
  });
  
  // İlk çinko kontrolü (bir satır tamamlanmış mı?)
  if (winType === 'cinko1') {
    return rowsComplete.some(complete => complete);
  }
  
  // İkinci çinko kontrolü (iki satır tamamlanmış mı?)
  if (winType === 'cinko2') {
    return rowsComplete.filter(complete => complete).length >= 2;
  }
  
  return false;
};

/**
 * Rastgele bir sayı çek (1-90 arası)
 * @param {array} drawnNumbers - Daha önce çekilmiş sayılar
 * @returns {number} Çekilen sayı
 */
export const drawNumber = (drawnNumbers = []) => {
  // Tüm sayılar çekildiyse null döndür
  if (drawnNumbers.length >= 90) return null;
  
  // Henüz çekilmemiş sayıları bul
  const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1)
    .filter(num => !drawnNumbers.includes(num));
  
  // Rastgele bir sayı seç
  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
  return availableNumbers[randomIndex];
};

/**
 * Belirli bir seed ile rastgele sayı çek (testler ve botlar için)
 * @param {array} drawnNumbers - Daha önce çekilmiş sayılar
 * @param {string} seed - Rastgele sayı üreteci için başlangıç değeri
 * @returns {number} Çekilen sayı
 */
export const drawSeededNumber = (drawnNumbers = [], seed) => {
  // Tüm sayılar çekildiyse null döndür
  if (drawnNumbers.length >= 90) return null;
  
  const rng = seedrandom(seed + drawnNumbers.length); // Seed'e mevcut çekilen sayı sayısını ekle
  
  // Henüz çekilmemiş sayıları bul
  const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1)
    .filter(num => !drawnNumbers.includes(num));
  
  // Rastgele bir sayı seç
  const randomIndex = Math.floor(rng() * availableNumbers.length);
  return availableNumbers[randomIndex];
};

/**
 * Socket.io bağlantısını başlat ve olay dinleyicilerini ayarla
 * @param {function} onConnect - Bağlantı kurulduğunda çağrılacak fonksiyon
 * @param {function} onDisconnect - Bağlantı kesildiğinde çağrılacak fonksiyon
 * @param {function} onReconnect - Yeniden bağlantı kurulduğunda çağrılacak fonksiyon
 * @returns {object} Socket bağlantısı
 */
export const initializeSocket = (onConnect, onDisconnect, onReconnect) => {
  // Socket bağlantısını başlat
  if (!socket.connected) {
    socket.connect();
  }
  
  // Olay dinleyicilerini temizle
  socket.off('connect');
  socket.off('disconnect');
  socket.off('reconnect');
  
  // Bağlantı olaylarını dinle
  if (onConnect) socket.on('connect', onConnect);
  if (onDisconnect) socket.on('disconnect', onDisconnect);
  if (onReconnect) socket.on('reconnect', onReconnect);
  
  return socket;
};

/**
 * Oyun odasına katıl ve güncellemeleri dinle
 * @param {string} gameId - Oyun kimliği
 * @param {string} playerId - Oyuncu kimliği
 * @param {function} onGameUpdate - Oyun güncellendiğinde çağrılacak fonksiyon 
 * @returns {function} Temizleme fonksiyonu
 */
export const joinGameRoom = (gameId, playerId, onGameUpdate) => {
  // Socket bağlantısını kontrol et
  if (!socket.connected) {
    socket.connect();
  }
  
  // Odaya katıl
  socket.emit('joinGame', { gameId, playerId });
  
  // Oyun güncellemelerini dinle
  socket.on('gameUpdate', (data) => {
    if (onGameUpdate) {
      onGameUpdate({ type: 'gameUpdate', gameState: data });
    }
  });
  
  // Yeni sayı çekildiğinde dinle
  socket.on('numberDrawn', (data) => {
    if (onGameUpdate) {
      onGameUpdate({ type: 'numberDrawn', number: data.number });
    }
  });
  
  // Yeni oyuncu katıldığında dinle
  socket.on('playerJoined', (data) => {
    if (onGameUpdate) {
      onGameUpdate({ type: 'playerJoined', player: data });
    }
  });
  
  // Oyuncu ayrıldığında dinle
  socket.on('playerLeft', (data) => {
    if (onGameUpdate) {
      onGameUpdate({ type: 'playerLeft', player: data });
    }
  });
  
  // Oyun bittiğinde dinle
  socket.on('gameEnded', (data) => {
    if (onGameUpdate) {
      onGameUpdate({ type: 'gameEnded', result: data });
    }
  });
  
  // Temizleme fonksiyonu döndür
  return () => {
    socket.off('gameUpdate');
    socket.off('numberDrawn');
    socket.off('playerJoined');
    socket.off('playerLeft');
    socket.off('gameEnded');
    socket.emit('leaveGame', { gameId, playerId });
  };
};

/**
 * Oyun durumunu diğer oyunculara bildir
 * @param {string} gameId - Oyun kimliği 
 * @param {object} gameState - Oyun durumu objesi
 * @returns {boolean} İşlem başarılı mı
 */
export const broadcastGameState = (gameId, gameState) => {
  if (!socket.connected) {
    console.warn('Socket bağlantısı yok, oyun durumu yayınlanamadı');
    return false;
  }
  
  socket.emit('updateGameState', { gameId, gameState });
  return true;
};

/**
 * Yeni çekilen sayıyı diğer oyunculara bildir
 * @param {string} gameId - Oyun kimliği
 * @param {number} number - Çekilen sayı
 * @returns {boolean} İşlem başarılı mı
 */
export const broadcastNewNumber = (gameId, number) => {
  if (!socket.connected) {
    console.warn('Socket bağlantısı yok, yeni sayı yayınlanamadı');
    return false;
  }
  
  socket.emit('drawNumber', { gameId, number });
  return true;
}; 