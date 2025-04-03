/**
 * Karttaki işaretli sayı sayısını kontrol eder ve 15 işaretli sayı olduğunda tombala durumunu belirler
 * @param {Array} card - Oyuncunun tombala kartı
 * @param {Array} drawnNumbers - Çekilen numaralar
 * @returns {Object} Kazanma durumu ve işaretli sayı sayısı
 */
const checkCardMarkedNumbers = (card, drawnNumbers) => {
  if (!card || !drawnNumbers || drawnNumbers.length === 0) {
    return { isTombala: false, markedCount: 0 };
  }
  
  // Karttaki tüm sayıları düz bir diziye çevir
  const allNumbers = card.flat().filter(num => num !== null);
  
  // İşaretlenen sayıları bul
  const markedNumbers = allNumbers.filter(num => drawnNumbers.includes(num));
  
  // İşaretlenen sayı sayısı
  const markedCount = markedNumbers.length;
  
  // Tombala durumu - 15 işaretli sayı olduğunda
  const isTombala = markedCount === 15;
  
  return { isTombala, markedCount };
};

// Export fonksiyonları
module.exports = {
  generateTombalaCard: (rows = 3, columns = 9) => {
    // Basit bir kart oluşturma işlevi
    const card = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        // Her sütun için sayı aralığı belirle
        const min = j * 10 + 1;
        const max = j === 8 ? 90 : (j + 1) * 10;
        
        // %60 ihtimalle sayı koy (her satırda yaklaşık 5 sayı)
        if (Math.random() < 0.6) {
          row.push(Math.floor(Math.random() * (max - min + 1)) + min);
        } else {
          row.push(null);
        }
      }
      card.push(row);
    }
    return card;
  },
  
  // Kazanma durumunu kontrol eden fonksiyon
  checkWinningCondition: (card, drawnNumbers) => {
    if (!card || !drawnNumbers || !Array.isArray(card) || !Array.isArray(drawnNumbers)) {
      return { cinko1: false, cinko2: false, tombala: false };
    }
    
    // Her satırdaki işaretli sayı sayısını hesapla
    const rowStatus = card.map(row => {
      const nonNullCount = row.filter(Boolean).length;
      const markedCount = row.filter(num => num !== null && drawnNumbers.includes(num)).length;
      return { 
        total: nonNullCount, 
        marked: markedCount, 
        completed: markedCount === nonNullCount && nonNullCount > 0 
      };
    });
    
    // Tamamlanmış satır sayısına göre kazanma durumunu belirle
    const completedRows = rowStatus.filter(r => r.completed).length;
    
    return {
      cinko1: completedRows >= 1,
      cinko2: completedRows >= 2,
      tombala: completedRows === 3
    };
  },
  
  // Karttaki işaretlenen sayı sayısını kontrol et
  checkCardMarkedNumbers,
}; 