const SHOP_ITEMS = {
  avatars: [
    {
      id: 'dragon',
      name: 'Dragon',
      emoji: '🐉',
      description: 'Legendary dragon avatar',
      price: 500,
      rarity: 'legendary'
    },
    {
      id: 'wizard',
      name: 'Wizard',
      emoji: '🧙‍♂️',
      description: 'Powerful wizard avatar',
      price: 300,
      rarity: 'epic'
    },
    {
      id: 'robot',
      name: 'Robot',
      emoji: '🤖',
      description: 'Futuristic robot avatar',
      price: 200,
      rarity: 'rare'
    },
    {
      id: 'alien',
      name: 'Alien',
      emoji: '👽',
      description: 'Mysterious alien avatar',
      price: 200,
      rarity: 'rare'
    },
    {
      id: 'knight',
      name: 'Knight',
      emoji: '🛡️',
      description: 'Noble knight avatar',
      price: 150,
      rarity: 'common'
    },
    {
      id: 'pirate',
      name: 'Pirate',
      emoji: '🏴‍☠️',
      description: 'Adventurous pirate avatar',
      price: 150,
      rarity: 'common'
    }
  ],
  
  powerUps: [
    {
      id: 'xp_boost',
      name: 'XP Boost',
      emoji: '⚡',
      description: 'Double XP for next study session',
      price: 100,
      rarity: 'rare',
      duration: '1_session'
    },
    {
      id: 'focus_potion',
      name: 'Focus Potion',
      emoji: '🧪',
      description: '+50% focus stats for 1 hour',
      price: 75,
      rarity: 'common',
      duration: '1_hour'
    },
    {
      id: 'time_freeze',
      name: 'Time Freeze',
      emoji: '⏰',
      description: 'Pause streak timer for 1 day',
      price: 200,
      rarity: 'epic',
      duration: '1_day'
    }
  ],
  
  backgrounds: [
    {
      id: 'galaxy',
      name: 'Galaxy',
      emoji: '🌌',
      description: 'Cosmic galaxy background',
      price: 250,
      rarity: 'epic',
      gradient: 'from-purple-900 via-blue-900 to-black'
    },
    {
      id: 'sunset',
      name: 'Sunset',
      emoji: '🌅',
      description: 'Beautiful sunset background',
      price: 150,
      rarity: 'rare',
      gradient: 'from-orange-500 via-pink-500 to-purple-600'
    },
    {
      id: 'forest',
      name: 'Forest',
      emoji: '🌲',
      description: 'Peaceful forest background',
      price: 100,
      rarity: 'common',
      gradient: 'from-green-700 via-green-600 to-green-800'
    }
  ],
  
  titles: [
    {
      id: 'scholar_supreme',
      name: 'Scholar Supreme',
      emoji: '👑',
      description: 'Ultimate scholar title',
      price: 1000,
      rarity: 'legendary'
    },
    {
      id: 'knowledge_seeker',
      name: 'Knowledge Seeker',
      emoji: '📖',
      description: 'Dedicated learner title',
      price: 300,
      rarity: 'epic'
    },
    {
      id: 'study_warrior',
      name: 'Study Warrior',
      emoji: '⚔️',
      description: 'Battle-hardened student',
      price: 150,
      rarity: 'rare'
    }
  ]
};

module.exports = SHOP_ITEMS;