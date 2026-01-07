const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  }
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

// Method to add item to inventory
inventorySchema.methods.addItem = function(itemId) {
  const hasItem = this.items.some(item => item.itemId === itemId);
  if (!hasItem) {
    this.items.push({ itemId });
  }
  return this;
};

// Method to check if user owns an item
inventorySchema.methods.hasItem = function(itemId) {
  return this.items.some(item => item.itemId === itemId);
};

// Method to equip item
inventorySchema.methods.equipItem = function(itemId, type) {
  const hasItem = this.items.some(item => item.itemId === itemId);
  if (hasItem) {
    this.equipped[type] = itemId;
  }
  return this;
};

// Method to unequip item
inventorySchema.methods.unequipItem = function(type) {
  this.equipped[type] = null;
  return this;
};

// Method to get all items of a specific type
inventorySchema.methods.getItemsByType = function(type) {
  return this.items.filter(item => {
    // You'll need to populate item details to filter by type
    return true; // For now return all
  });
};

module.exports = mongoose.model('Inventory', inventorySchema);