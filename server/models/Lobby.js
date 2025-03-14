const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  game: {
    type: String,
    required: true,
    enum: ['xox', 'satranç', 'tavla', 'okey', 'king', 'poker', 'pişti', 'batak', 'bingo', 'tombala', 'mines', 'crash', 'wheel', 'dice', 'coinflip', 'hilo', 'blackjack', 'tower', 'roulette', 'stairs', 'keno']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    max: 8
  },
  betAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: function() {
      return this.isPrivate;
    }
  },
  isEventLobby: {
    type: Boolean,
    default: false
  },
  eventDetails: {
    title: String,
    description: String,
    startDate: Date,
    endDate: Date
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  },
  lobbyCode: {
    type: String,
    unique: true,
    sparse: true // Boş değer eklenmesine izin ver, sadece dolu değerler için unique kontrol yapılır
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { 
      expires: 8 * 60 * 60, // 8 saat sonra otomatik silme (saniye cinsinden)
      partialFilterExpression: { isEventLobby: false } // Etkinlik lobileri için silinmez
    }
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

// Lobi kodu oluşturmak için pre-save hook
lobbySchema.pre('save', async function(next) {
  if (!this.lobbyCode) {
    // Benzersiz bir kod bulana kadar deneme yap
    let isUnique = false;
    let lobbyCode = '';
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      lobbyCode = generateLobbyCode();
      attempts++;
      
      // Kod zaten mevcut mu kontrol et
      const existingLobby = await mongoose.model('Lobby').findOne({ lobbyCode });
      if (!existingLobby) {
        isUnique = true;
      }
    }
    
    if (!isUnique) {
      // Daha spesifik bir kod oluştur
      lobbyCode = generateLobbyCode(8);
    }
    
    this.lobbyCode = lobbyCode;
  }
  next();
});

module.exports = mongoose.model('Lobby', lobbySchema); 