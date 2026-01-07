const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ShopItem = require('../models/ShopItem');
const Inventory = require('../models/Inventory');
const Character = require('../models/Character');

// Get all shop items
router.get('/items', auth, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    const items = await ShopItem.find({ available: true });
    
    // Filter items by level requirement
    const availableItems = items.filter(item => item.levelRequired <= character.level);
    
    res.json(availableItems);
  } catch (error) {
    console.error('Get shop items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's inventory
router.get('/inventory', auth, async (req, res) => {
  try {
    let inventory = await Inventory.findOne({ userId: req.userId });
    
    if (!inventory) {
      inventory = new Inventory({ userId: req.userId, items: [], equipped: {} });
      await inventory.save();
    }
    
    // Populate item details
    const itemIds = inventory.items.map(item => item.itemId);
    const itemDetails = await ShopItem.find({ itemId: { $in: itemIds } });
    
    const inventoryWithDetails = {
      ...inventory.toObject(),
      itemDetails: itemDetails
    };
    
    res.json(inventoryWithDetails);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Purchase item
router.post('/purchase/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Get item details
    const item = await ShopItem.findOne({ itemId, available: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Get character
    const character = await Character.findOne({ userId: req.userId });
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check level requirement
    if (character.level < item.levelRequired) {
      return res.status(400).json({ 
        message: `You need to be level ${item.levelRequired} to purchase this item` 
      });
    }
    
    // Check if user has enough gold
    if (character.gold < item.price) {
      return res.status(400).json({ message: 'Not enough gold' });
    }
    
    // Get or create inventory
    let inventory = await Inventory.findOne({ userId: req.userId });
    if (!inventory) {
      inventory = new Inventory({ userId: req.userId, items: [], equipped: {} });
    }
    
    // Check if already owned
    const alreadyOwned = inventory.items.some(i => i.itemId === itemId);
    if (alreadyOwned) {
      return res.status(400).json({ message: 'You already own this item' });
    }
    
    // Deduct gold
    character.gold -= item.price;
    await character.save();
    
    // Add item to inventory
    inventory.addItem(itemId);
    await inventory.save();
    
    res.json({
      message: 'Item purchased successfully',
      item: item,
      remainingGold: character.gold,
      inventory: inventory
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Failed to purchase item' });
  }
});

// Equip item
router.post('/equip/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Get item details
    const item = await ShopItem.findOne({ itemId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Get inventory
    const inventory = await Inventory.findOne({ userId: req.userId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    // Check if user owns the item
    const ownsItem = inventory.items.some(i => i.itemId === itemId);
    if (!ownsItem) {
      return res.status(400).json({ message: 'You do not own this item' });
    }
    
    // Equip item
    inventory.equipItem(itemId, item.type);
    await inventory.save();
    
    res.json({
      message: 'Item equipped successfully',
      equipped: inventory.equipped
    });
  } catch (error) {
    console.error('Equip error:', error);
    res.status(500).json({ message: 'Failed to equip item' });
  }
});

// Unequip item
router.post('/unequip/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    
    const inventory = await Inventory.findOne({ userId: req.userId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    inventory.unequipItem(type);
    await inventory.save();
    
    res.json({
      message: 'Item unequipped successfully',
      equipped: inventory.equipped
    });
  } catch (error) {
    console.error('Unequip error:', error);
    res.status(500).json({ message: 'Failed to unequip item' });
  }
});

module.exports = router;