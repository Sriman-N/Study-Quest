const ACHIEVEMENTS = [
  {
    id: 'first_session',
    title: 'First Steps',
    description: 'Complete your first study session',
    icon: '🎯',
    xpReward: 10,
    check: (stats) => stats.totalSessions >= 1
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Study 5 sessions',
    icon: '🌅',
    xpReward: 25,
    check: (stats) => stats.totalSessions >= 5
  },
  {
    id: 'dedicated',
    title: 'Dedicated Student',
    description: 'Study 10 sessions',
    icon: '📚',
    xpReward: 50,
    check: (stats) => stats.totalSessions >= 10
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Study 25 sessions',
    icon: '🎓',
    xpReward: 100,
    check: (stats) => stats.totalSessions >= 25
  },
  {
    id: 'one_hour',
    title: 'Hour Power',
    description: 'Study for 60 minutes total',
    icon: '⏱️',
    xpReward: 20,
    check: (stats) => stats.totalMinutes >= 60
  },
  {
    id: 'five_hours',
    title: 'Marathon Runner',
    description: 'Study for 5 hours total',
    icon: '🏃',
    xpReward: 75,
    check: (stats) => stats.totalMinutes >= 300
  },
  {
    id: 'ten_hours',
    title: 'Time Master',
    description: 'Study for 10 hours total',
    icon: '⏰',
    xpReward: 150,
    check: (stats) => stats.totalMinutes >= 600
  },
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    xpReward: 50,
    check: (stats) => stats.level >= 5
  },
  {
    id: 'level_10',
    title: 'Expert',
    description: 'Reach level 10',
    icon: '💫',
    xpReward: 100,
    check: (stats) => stats.level >= 10
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    description: 'Study 3 days in a row',
    icon: '🔥',
    xpReward: 30,
    check: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Study 7 days in a row',
    icon: '🔥🔥',
    xpReward: 100,
    check: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'multi_subject',
    title: 'Well Rounded',
    description: 'Study 3 different subjects',
    icon: '🌈',
    xpReward: 40,
    check: (stats) => Object.keys(stats.subjectBreakdown || {}).length >= 3
  }
];

module.exports = ACHIEVEMENTS;