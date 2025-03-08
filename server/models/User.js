// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  profileImage: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.username}`;
    }
  },
  language: {
    type: String,
    default: 'tr',
    enum: ['tr', 'en']
  },
  theme: {
    type: String,
    default: 'dark',
    enum: ['dark', 'light']
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0
    },
    gamesWon: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Şifreyi hashle
UserSchema.pre('save', async function(next) {
  const user = this;
  
  // Şifre değişmediyse veya yeni kayıt değilse, devam et
  if (!user.isModified('password')) return next();
  
  try {
    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    
    // Hash'lenmiş şifreyi kaydet
    user.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

// Şifreyi karşılaştır
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);
