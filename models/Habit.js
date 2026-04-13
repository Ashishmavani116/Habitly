const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  emoji: {
    type: String,
    default: '💪'
  },
  color: {
    type: String,
    default: '#FF6B6B'
  },
  streak: {
    type: Number,
    default: 0
  },
  history: {
    type: Map,
    of: Boolean,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Habit', habitSchema);
