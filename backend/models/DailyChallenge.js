const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'study_time', 'streak'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  // For quiz challenges
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  subject: String,
  
  // Rewards
  xpReward: {
    type: Number,
    default: 50
  },
  goldReward: {
    type: Number,
    default: 10
  },
  
  // Status
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  score: Number, // For quiz challenges
  
  // Expiration
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

dailyChallengeSchema.index({ userId: 1, expiresAt: 1 });

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);