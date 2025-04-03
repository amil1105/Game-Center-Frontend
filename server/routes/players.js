const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Lobby = require('../models/Lobby');
const { isValidObjectId } = require('mongoose');
const mongoose = require('mongoose');

// Aktif oyuncuları getir
router.get('/active', auth, async (req, res) => {
  try {
    // Son 1 saat içinde aktif olan kullanıcıları getir
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const activePlayers = await User.find({
      lastActive: { $gte: oneHourAgo }
    })
    .select('_id username email profileImage')
    .limit(20);
    
    // Aktif oyuncuları formatla ve gönder
    const formattedPlayers = activePlayers.map(player => ({
      id: player._id,
      name: player.username || player.email.split('@')[0],
      points: 0,
      isBot: false,
      isReady: false,
      isHost: false
    }));
    
    res.json(formattedPlayers);
  } catch (error) {
    console.error('Aktif oyuncular listelenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oyuncu kartlarını getir
router.get('/cards/:lobbyId', auth, async (req, res) => {
  try {
    const { lobbyId } = req.params;
    
    if (!lobbyId) {
      return res.status(400).json({ error: 'Lobi ID gereklidir' });
    }
    
    let lobby;
    
    // Lobi ID veya kod olabilir
    if (isValidObjectId(lobbyId)) {
      lobby = await Lobby.findById(lobbyId);
    } else {
      lobby = await Lobby.findOne({ lobbyCode: lobbyId });
    }
    
    if (!lobby) {
      return res.status(404).json({ error: 'Lobi bulunamadı' });
    }
    
    // Bu lobi için kayıtlı kartlar varsa getir
    // Not: Bu verileri kendi modelinizde saklayabilirsiniz
    
    // Demo kart verileri
    const demoCards = Array.from({ length: 3 }, (_, index) => ({
      id: `card_${index + 1}`,
      playerId: req.user._id,
      numbers: generateTombalaCard()
    }));
    
    res.json(demoCards);
  } catch (error) {
    console.error('Oyuncu kartları alınırken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tombala kartı oluştur (yardımcı fonksiyon)
function generateTombalaCard() {
  // Toplam 3 satır, her satırda 9 hücre
  const card = {
    rows: [
      Array(9).fill(null),
      Array(9).fill(null),
      Array(9).fill(null)
    ]
  };
  
  // Her sütun için sayı aralıkları
  const columnRanges = [
    { min: 1, max: 9 },   // 1. sütun: 1-9
    { min: 10, max: 19 }, // 2. sütun: 10-19
    { min: 20, max: 29 }, // 3. sütun: 20-29
    { min: 30, max: 39 }, // 4. sütun: 30-39
    { min: 40, max: 49 }, // 5. sütun: 40-49
    { min: 50, max: 59 }, // 6. sütun: 50-59
    { min: 60, max: 69 }, // 7. sütun: 60-69
    { min: 70, max: 79 }, // 8. sütun: 70-79
    { min: 80, max: 90 }  // 9. sütun: 80-90
  ];
  
  // Her satırda 5 sayı olacak şekilde rastgele sütunları doldur
  for (let row = 0; row < 3; row++) {
    // Her satır için 5 random sütun seç
    const columnsToFill = getRandomColumns(5, 9);
    
    for (const col of columnsToFill) {
      const range = columnRanges[col];
      let number;
      
      // Her sütun için benzersiz bir sayı seç
      do {
        number = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      } while (isNumberUsedInColumn(card, col, number));
      
      card.rows[row][col] = number;
    }
  }
  
  // Kart verilerini düzleştir
  const flatCard = [];
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      const value = card.rows[row][col];
      
      flatCard.push({
        row,
        col,
        value
      });
    }
  }
  
  return flatCard;
}

// Daha önce bir sütunda sayının kullanılıp kullanılmadığını kontrol et
function isNumberUsedInColumn(card, col, number) {
  for (let row = 0; row < 3; row++) {
    if (card.rows[row][col] === number) {
      return true;
    }
  }
  return false;
}

// Benzersiz rastgele sütun sayıları seç
function getRandomColumns(count, max) {
  const columns = [];
  while (columns.length < count) {
    const col = Math.floor(Math.random() * max);
    if (!columns.includes(col)) {
      columns.push(col);
    }
  }
  return columns;
}

module.exports = router; 