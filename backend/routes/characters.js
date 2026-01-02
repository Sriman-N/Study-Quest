const express = require('express');
const router = express.Router();
const Character = require('../models/Character');
const auth = require('../middleware/auth');

// Get character for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create character
router.post('/', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    // Check if user already has a character
    const existingCharacter = await Character.findOne({ userId: req.userId });
    if (existingCharacter) {
      return res.status(400).json({ message: 'Character already exists' });
    }

    // Create new character using userId from auth middleware
    const character = new Character({
      userId: req.userId,  // Get from JWT token, not request body
      name,
      avatar
    });

    await character.save();

    res.status(201).json(character);
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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