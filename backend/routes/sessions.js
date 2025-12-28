const express = require('express');
const router = express.Router();
const StudySession = require('../models/StudySession');
const Character = require('../models/Character');
const Achievement = require('../models/Achievement');
const ACHIEVEMENTS = require('../utils/achievements');

// Create a study session and award XP
router.post('/', async (req, res) => {
  try {
    const { userId, characterId, subject, duration } = req.body;

    // Calculate XP (1 XP per minute studied)
    const xpEarned = duration;

    // Create study session
    const session = new StudySession({
      userId,
      characterId,
      subject,
      duration,
      xpEarned
    });

    await session.save();

    // Update character with XP
    const character = await Character.findById(characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Add XP and check for level up
    const result = character.addXP(xpEarned);
    character.totalStudyTime += duration;
    
    await character.save();

    // Check for achievements
    const newAchievements = await checkAchievements(userId);

    res.status(201).json({
      message: 'Study session completed!',
      session,
      character: result.character,
      leveledUp: result.leveledUp,
      levelsGained: result.levelsGained,
      newLevel: result.newLevel,
      xpEarned,
      newAchievements: newAchievements.achievements,
      achievementXP: newAchievements.totalXP
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to check achievements
async function checkAchievements(userId) {
  try {
    const unlockedAchievements = await Achievement.find({ userId });
    const unlockedIds = unlockedAchievements.map(a => a.achievementId);

    const character = await Character.findOne({ userId });
    const sessions = await StudySession.find({ userId });

    const stats = {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
      level: character?.level || 1,
      currentStreak: character?.currentStreak || 0,
      subjectBreakdown: {}
    };

    sessions.forEach(session => {
      if (!stats.subjectBreakdown[session.subject]) {
        stats.subjectBreakdown[session.subject] = 0;
      }
      stats.subjectBreakdown[session.subject] += session.duration;
    });

    const newlyUnlocked = [];
    let totalXpReward = 0;

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.includes(achievement.id)) continue;

      if (achievement.check(stats)) {
        const newAchievement = new Achievement({
          userId,
          achievementId: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon
        });

        await newAchievement.save();
        newlyUnlocked.push(achievement);
        totalXpReward += achievement.xpReward;
      }
    }

    if (totalXpReward > 0 && character) {
      character.addXP(totalXpReward);
      await character.save();
    }

    return { achievements: newlyUnlocked, totalXP: totalXpReward };
  } catch (error) {
    console.error('Check achievements error:', error);
    return { achievements: [], totalXP: 0 };
  }
}

// Get all sessions for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.params.userId })
      .sort({ completedAt: -1 })  // Most recent first
      .limit(20);  // Last 20 sessions

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get study stats for a user
router.get('/stats/:userId', async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.params.userId });

    const stats = {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
      totalXP: sessions.reduce((sum, s) => sum + s.xpEarned, 0),
      subjectBreakdown: {}
    };

    // Calculate time per subject
    sessions.forEach(session => {
      if (!stats.subjectBreakdown[session.subject]) {
        stats.subjectBreakdown[session.subject] = 0;
      }
      stats.subjectBreakdown[session.subject] += session.duration;
    });

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;