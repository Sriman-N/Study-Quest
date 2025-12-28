const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure user can't unlock same achievement twice
achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);