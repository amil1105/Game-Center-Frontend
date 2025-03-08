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
    enum: ['xox', 'satranç', 'tavla', 'okey', 'king', 'poker', 'pişti', 'batak']
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
  createdAt: {
    type: Date,
    default: Date.now,
    index: { 
      expires: 8 * 60 * 60, // 8 saat sonra otomatik silme (saniye cinsinden)
      partialFilterExpression: { isEventLobby: false } // Etkinlik lobileri için silinmez
    }
  }
});

module.exports = mongoose.model('Lobby', lobbySchema); 