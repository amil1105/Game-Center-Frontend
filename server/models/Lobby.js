const mongoose = require('mongoose');

// Tekil bir oyuncu için schema
const playerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String
  },
  isReady: {
    type: Boolean,
    default: false
  },
  isBot: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Mesaj şeması
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isSystem; // Eğer sistem mesajı değilse gönderici zorunlu
    }
  },
  text: {
    type: String,
    required: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

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
  players: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    validate: {
      validator: function(array) {
        // Benzersiz kullanıcı ID'leri kontrolü
        return new Set(array.map(v => v.toString())).size === array.length;
      },
      message: 'Oyuncu listesi benzersiz kullanıcı ID\'leri içermelidir'
    }
  },
  // Detaylı oyuncu bilgileri
  playersDetail: [playerSchema],
  // Lobi mesajları
  messages: [messageSchema],
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
  // Tombala için çekilen sayılar
  drawnNumbers: {
    type: [Number],
    default: []
  },
  // Tombala için son çekilen sayı
  currentNumber: {
    type: Number,
    default: null
  },
  // Tombala için kazananlar
  winners: {
    type: Array,
    default: []
  },
  lobbyCode: {
    type: String,
    unique: true,
    sparse: true // Boş değer eklenmesine izin ver, sadece dolu değerler için unique kontrol yapılır
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // Normal lobiler için 8 saat sonra otomatik silme (saniye cinsinden)
    // Etkinlik lobileri için TTL indeksi uygulanmaz
    index: { 
      expires: 8 * 60 * 60, 
      partialFilterExpression: { isEventLobby: false } 
    }
  }
});

// Lobi kaydedilmeden önce, playersDetail için benzersizlik kontrolü
lobbySchema.pre('save', async function(next) {
  // Oyuncular dizisindeki benzersiz ID'leri kontrol et
  const playerIds = this.players.map(p => p.toString());
  const uniquePlayerIds = [...new Set(playerIds)];
  
  if (playerIds.length !== uniquePlayerIds.length) {
    // Tekrarlanan oyuncuları kaldır
    this.players = uniquePlayerIds.map(id => mongoose.Types.ObjectId(id));
    console.log('Tekrarlanan oyuncular kaldırıldı');
  }
  
  // PlayerDetail dizisinde aynı kullanıcı ID'si için birden fazla kayıt varsa düzelt
  if (this.playersDetail && this.playersDetail.length > 0) {
    const playerDetailMap = new Map();
    
    // En son eklenen oyuncu detayını koru
    for (const detail of this.playersDetail) {
      if (detail.user) {
        const userId = detail.user.toString();
        playerDetailMap.set(userId, detail);
      }
    }
    
    // Benzersiz oyuncu detaylarını kullan
    this.playersDetail = Array.from(playerDetailMap.values());
  }
  
  next();
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
  
  // Etkinlik lobisi ise ve başlama tarihi belirtilmişse, durumu kontrol et
  if (this.isEventLobby && this.eventDetails && this.eventDetails.startDate) {
    const now = new Date();
    if (this.eventDetails.startDate <= now && this.eventDetails.endDate > now) {
      this.status = 'playing';
    } else if (this.eventDetails.startDate > now) {
      this.status = 'waiting';
    } else if (this.eventDetails.endDate <= now) {
      this.status = 'finished';
    }
  }
  
  next();
});

module.exports = mongoose.model('Lobby', lobbySchema); 