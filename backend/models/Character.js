const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // Each user can only have one character
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  avatar: {
    type: String,
    default: 'warrior'  // warrior, mage, scholar, ninja
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  stats: {
    focus: {
      type: Number,
      default: 1
    },
    knowledge: {
      type: Number,
      default: 1
    },
    discipline: {
      type: Number,
      default: 1
    }
  },
  totalStudyTime: {
    type: Number,
    default: 0  // in minutes
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }, 
  gold: {
  type: Number,
  default: 0
  }
});


// Method to calculate XP needed for next level
characterSchema.methods.getXPForNextLevel = function() {
  // Progressive XP: Level 2 = 100, Level 3 = 150, Level 4 = 225, etc.
  return Math.floor(100 * Math.pow(1.5, this.level - 1));
};

characterSchema.methods.addGold = function(amount) {
  this.gold += amount;
  return this.gold;
};

characterSchema.methods.spendGold = function(amount) {
  if (this.gold >= amount) {
    this.gold -= amount;
    return true;
  }
  return false;
};

// Method to add XP and handle level ups
characterSchema.methods.addXP = function(amount) {
  this.xp += amount;
  
  let leveledUp = false; 
  const levelsGained = [];
  
  while (this.xp >= this.getXPForNextLevel()) {
    const xpNeeded = this.getXPForNextLevel();
    this.xp -= xpNeeded;
    this.level += 1;
    
    // Increase stats on level up
    this.stats.focus += 1;
    this.stats.knowledge += 1;
    this.stats.discipline += 1;
    
    levelsGained.push(this.level);
    leveledUp = true;
  }
  
  return { 
    character: this, 
    leveledUp,
    levelsGained,
    newLevel: this.level
  };
};

module.exports = mongoose.model('Character', characterSchema);