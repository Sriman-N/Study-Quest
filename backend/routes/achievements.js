const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const Character = require('../models/Character');
const StudySession = require('../models/StudySession');
const ACHIEVEMENTS = require('../utils/achievements');

// Check and unlock new achievements for a user
router.post('/check/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user's current achievements
    const unlockedAchievements = await Achievement.find({ userId });
    const unlockedIds = unlockedAchievements.map(a => a.achievementId);

    // Get user stats
    const character = await Character.findOne({ userId });
    const sessions = await StudySession.find({ userId });

    const stats = {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
      level: character?.level || 1,
      currentStreak: character?.currentStreak || 0,
      subjectBreakdown: {}
    };

    // Calculate subject breakdown
    sessions.forEach(session => {
      if (!stats.subjectBreakdown[session.subject]) {
        stats.subjectBreakdown[session.subject] = 0;
      }
      stats.subjectBreakdown[session.subject] += session.duration;
    });

    // Check for new achievements
    const newlyUnlocked = [];
    let totalXpReward = 0;

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (unlockedIds.includes(achievement.id)) continue;

      // Check if criteria met
      if (achievement.check(stats)) {
        // Unlock achievement
        const newAchievement = new Achievement({
          userId,
          achievementId: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon
        });

        await newAchievement.save();
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: newAchievement.unlockedAt
        });

        totalXpReward += achievement.xpReward;
      }
    }

    // Award XP to character
    if (totalXpReward > 0 && character) {
      character.addXP(totalXpReward);
      await character.save();
    }

    res.json({
      newAchievements: newlyUnlocked,
      totalXpReward,
      message: newlyUnlocked.length > 0 
        ? `Unlocked ${newlyUnlocked.length} new achievement(s)!` 
        : 'No new achievements'
    });

  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all achievements for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const unlocked = await Achievement.find({ userId }).sort({ unlockedAt: -1 });

    // Get all possible achievements with unlock status
    const unlockedIds = unlocked.map(a => a.achievementId);
    
    const allAchievements = ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id),
      unlockedAt: unlocked.find(a => a.achievementId === achievement.id)?.unlockedAt
    }));

    res.json({
      achievements: allAchievements,
      unlockedCount: unlocked.length,
      totalCount: ACHIEVEMENTS.length
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;