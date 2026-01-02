const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['avatar', 'background', 'power_up', 'cosmetic'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  equippedAt: Date
});

const inventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [inventoryItemSchema],
  equipped: {
    avatar: String,
    background: String,
    title: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);