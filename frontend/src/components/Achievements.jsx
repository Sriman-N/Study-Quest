import { useState, useEffect } from 'react';
import axios from 'axios';

const Achievements = ({ userId }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      const response = await axios.get(`/api/achievements/user/${userId}`);
      setAchievements(response.data.achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAchievements = () => {
    if (filter === 'unlocked') {
      return achievements.filter(a => a.unlocked);
    } else if (filter === 'locked') {
      return achievements.filter(a => !a.unlocked);
    }
    return achievements;
  };

  const getProgress = () => {
    const unlocked = achievements.filter(a => a.unlocked).length;
    const total = achievements.length;
    return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <p className="text-white text-center">Loading achievements...</p>
      </div>
    );
  }

  const filteredAchievements = filterAchievements();
  const progress = getProgress();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">🏆 Achievements</h3>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'all' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'unlocked' 
                ? 'bg-green-600 text-white' 
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            Unlocked
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'locked' 
                ? 'bg-gray-600 text-white' 
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            Locked
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Progress</span>
          <span className="font-semibold">{progress.unlocked} / {progress.total} ({progress.percentage}%)</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden border border-white/20">
          <div
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border transition-all ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 hover:scale-105'
                : 'bg-white/5 border-white/10 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold mb-1 ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {achievement.title}
                </h4>
                <p className="text-gray-300 text-sm mb-2">
                  {achievement.description}
                </p>
                {achievement.unlocked ? (
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-xs font-semibold">✓ Unlocked</span>
                    <span className="text-yellow-400 text-xs font-semibold">+{achievement.xpReward} XP</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">🔒 Locked</span>
                    <span className="text-gray-500 text-xs">+{achievement.xpReward} XP</span>
                  </div>
                )}
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            {filter === 'unlocked' 
              ? 'No achievements unlocked yet. Keep studying!' 
              : 'No locked achievements to show.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Achievements;