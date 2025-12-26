const express = require('express');
const router = express.Router();
const Character = require('../models/Character');

// Create character
router.post('/', async (req, res) => {
  try {
    const { userId, name, avatar } = req.body;

    // Check if user already has a character
    const existingCharacter = await Character.findOne({ userId });
    if (existingCharacter) {
      return res.status(400).json({ message: 'Character already exists' });
    }

    // Create new character
    const character = new Character({
      userId,
      name,
      avatar: avatar || 'warrior'
    });

    await character.save();

    res.status(201).json({
      message: 'Character created successfully',
      character
    });

  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get character by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.userId });
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json(character);
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update character
router.put('/:id', async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    const character = await Character.findByIdAndUpdate(
      req.params.id,
      { name, avatar },
      { new: true }  // Return updated document
    );

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json(character);
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all characters - FOR TESTING ONLY
router.get('/all', async (req, res) => {
  try {
    const characters = await Character.find({});
    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching characters' });
  }
});

module.exports = router;