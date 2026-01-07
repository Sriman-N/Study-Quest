const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['avatar', 'background', 'title', 'power_up', 'cosmetic'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  effect: {
    type: {
      type: String
    },
    description: String,
    value: Number
  },
  levelRequired: {
    type: Number,
    default: 1
  },
  available: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('ShopItem', shopItemSchema);