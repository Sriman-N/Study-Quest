const mongoose = require('mongoose');
const ShopItem = require('../models/ShopItem');
require('dotenv').config();

const shopItems = [
  // Avatars
  {
    itemId: 'avatar_wizard',
    name: 'Wizard Avatar',
    description: 'Mystical wizard avatar for the scholarly student',
    type: 'avatar',
    rarity: 'common',
    price: 50,
    image: '🧙‍♂️',
    levelRequired: 1
  },
  {
    itemId: 'avatar_scientist',
    name: 'Scientist Avatar',
    description: 'Lab coat wearing genius avatar',
    type: 'avatar',
    rarity: 'common',
    price: 50,
    image: '👨‍🔬',
    levelRequired: 1
  },
  {
    itemId: 'avatar_ninja',
    name: 'Ninja Avatar',
    description: 'Stealthy ninja master of knowledge',
    type: 'avatar',
    rarity: 'rare',
    price: 150,
    image: '🥷',
    levelRequired: 5
  },
  {
    itemId: 'avatar_robot',
    name: 'Robot Avatar',
    description: 'Futuristic AI learning companion',
    type: 'avatar',
    rarity: 'epic',
    price: 300,
    image: '🤖',
    levelRequired: 10
  },
  {
    itemId: 'avatar_dragon',
    name: 'Dragon Avatar',
    description: 'Legendary dragon of wisdom',
    type: 'avatar',
    rarity: 'legendary',
    price: 500,
    image: '🐉',
    levelRequired: 15
  },
  
  // Backgrounds
  {
    itemId: 'bg_library',
    name: 'Library Background',
    description: 'Study in a grand library',
    type: 'background',
    rarity: 'common',
    price: 75,
    image: '📚',
    levelRequired: 1
  },
  {
    itemId: 'bg_space',
    name: 'Space Background',
    description: 'Study among the stars',
    type: 'background',
    rarity: 'rare',
    price: 200,
    image: '🌌',
    levelRequired: 5
  },
  {
    itemId: 'bg_mountain',
    name: 'Mountain Peak Background',
    description: 'Study at the peak of knowledge',
    type: 'background',
    rarity: 'epic',
    price: 350,
    image: '⛰️',
    levelRequired: 10
  },
  
  // Titles
  {
    itemId: 'title_scholar',
    name: 'Scholar',
    description: 'Display your dedication to learning',
    type: 'title',
    rarity: 'common',
    price: 100,
    levelRequired: 3
  },
  {
    itemId: 'title_genius',
    name: 'Genius',
    description: 'Show off your intellectual prowess',
    type: 'title',
    rarity: 'rare',
    price: 250,
    levelRequired: 8
  },
  {
    itemId: 'title_master',
    name: 'Master of Knowledge',
    description: 'The ultimate title for true masters',
    type: 'title',
    rarity: 'legendary',
    price: 600,
    levelRequired: 20
  },
  
  // Power-ups
  {
    itemId: 'powerup_xp_boost',
    name: 'XP Boost (24h)',
    description: 'Gain 50% more XP for 24 hours',
    type: 'power_up',
    rarity: 'rare',
    price: 200,
    effect: {
      type: 'xp_boost',
      description: '+50% XP for 24 hours',
      value: 1.5
    },
    levelRequired: 5
  },
  {
    itemId: 'powerup_gold_boost',
    name: 'Gold Boost (24h)',
    description: 'Earn 50% more gold for 24 hours',
    type: 'power_up',
    rarity: 'rare',
    price: 200,
    effect: {
      type: 'gold_boost',
      description: '+50% Gold for 24 hours',
      value: 1.5
    },
    levelRequired: 5
  },
  {
    itemId: 'powerup_hint',
    name: 'Quiz Hint',
    description: 'Eliminate one wrong answer in your next quiz',
    type: 'power_up',
    rarity: 'common',
    price: 50,
    effect: {
      type: 'hint',
      description: 'Remove one wrong answer',
      value: 1
    },
    levelRequired: 1
  }
];

async function seedShopItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing items
    await ShopItem.deleteMany({});
    console.log('Cleared existing shop items');
    
    // Insert new items
    await ShopItem.insertMany(shopItems);
    console.log(`Inserted ${shopItems.length} shop items`);
    
    console.log('Shop items seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding shop items:', error);
    process.exit(1);
  }
}

seedShopItems();