const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  characterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true  // in minutes
  },
  xpEarned: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudySession', studySessionSchema);