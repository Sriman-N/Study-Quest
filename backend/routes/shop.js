const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Character = require('../models/Character');
const Inventory = require('../models/Inventory');
const SHOP_ITEMS = require('../config/shopItems');

// Get all shop items
router.get('/items', auth, async (req, res) => {
  try {
    res.json(SHOP_ITEMS);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's inventory
router.get('/inventory', auth, async (req, res) => {
  try {
    let inventory = await Inventory.findOne({ userId: req.userId });
    
    if (!inventory) {
      inventory = new Inventory({
        userId: req.userId,
        items: [],
        equipped: {}
      });
      await inventory.save();
    }
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Purchase item
router.post('/purchase', auth, async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    
    // Find the item in shop
    let item = null;
    let category = '';
    
    if (SHOP_ITEMS.avatars.find(i => i.id === itemId)) {
      item = SHOP_ITEMS.avatars.find(i => i.id === itemId);
      category = 'avatar';
    } else if (SHOP_ITEMS.powerUps.find(i => i.id === itemId)) {
      item = SHOP_ITEMS.powerUps.find(i => i.id === itemId);
      category = 'power_up';
    } else if (SHOP_ITEMS.backgrounds.find(i => i.id === itemId)) {
      item = SHOP_ITEMS.backgrounds.find(i => i.id === itemId);
      category = 'background';
    } else if (SHOP_ITEMS.titles.find(i => i.id === itemId)) {
      item = SHOP_ITEMS.titles.find(i => i.id === itemId);
      category = 'cosmetic';
    }
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user has enough gold
    const character = await Character.findOne({ userId: req.userId });
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    if (character.gold < item.price) {
      return res.status(400).json({ message: 'Not enough gold' });
    }
    
    // Check if user already owns this item
    let inventory = await Inventory.findOne({ userId: req.userId });
    if (!inventory) {
      inventory = new Inventory({
        userId: req.userId,
        items: [],
        equipped: {}
      });
    }
    
    const alreadyOwns = inventory.items.some(i => i.itemId === itemId);
    if (alreadyOwns) {
      return res.status(400).json({ message: 'You already own this item' });
    }
    
    // Deduct gold
    character.spendGold(item.price);
    await character.save();
    
    // Add item to inventory
    inventory.items.push({
      itemId: item.id,
      name: item.name,
      type: category,
      rarity: item.rarity
    });
    await inventory.save();
    
    res.json({
      message: 'Purchase successful',
      item,
      remainingGold: character.gold,
      inventory
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Equip item
router.post('/equip', auth, async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    
    const inventory = await Inventory.findOne({ userId: req.userId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    const item = inventory.items.find(i => i.itemId === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in inventory' });
    }
    
    // Equip the item based on type
    if (item.type === 'avatar') {
      inventory.equipped.avatar = itemId;
      
      // Also update character avatar
      const character = await Character.findOne({ userId: req.userId });
      if (character) {
        character.avatar = itemId;
        await character.save();
      }
    } else if (item.type === 'background') {
      inventory.equipped.background = itemId;
    } else if (item.type === 'cosmetic') {
      inventory.equipped.title = itemId;
    }
    
    // Update equipped timestamp
    item.equippedAt = new Date();
    await inventory.save();
    
    res.json({
      message: 'Item equipped successfully',
      inventory
    });
  } catch (error) {
    console.error('Equip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;