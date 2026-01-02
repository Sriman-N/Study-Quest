import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudyTimer from '../components/StudyTimer';
import SessionHistory from '../components/SessionHistory';
import StudyStats from '../components/StudyStats';
import Achievements from '../components/Achievements';
import { BookOpen } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAndCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserAndCharacter = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch character
      const response = await axios.get('http://localhost:5000/api/characters', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCharacter(response.data);
      
      // Set a basic user object from token (you can decode JWT if needed)
      setUser({ id: response.data.userId });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching character:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 404) {
        navigate('/create-character');
      }
      setLoading(false);
    }
  };

  const handleSessionComplete = () => {
    fetchUserAndCharacter();
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">No character found. Please create one!</div>
      </div>
    );
  }

  const avatarEmojis = {
    warrior: '⚔️',
    mage: '🧙',
    scholar: '📚',
    ninja: '🥷',
    // Add new avatars from shop
    dragon: '🐉',
    wizard: '🧙‍♂️',
    robot: '🤖',
    alien: '👽',
    knight: '🛡️',
    pirate: '🏴‍☠️'
  };

  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, character.level - 1));
  const xpPercentage = (character.xp / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Study Quest</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              🛒 Shop
            </button>
            <button
              onClick={() => navigate('/study-materials')}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Study Materials
            </button>
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Character Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-7xl">{avatarEmojis[character.avatar] || '⚔️'}</div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-1">
                  {character.name}
                </h2>
                <p className="text-gray-300 text-lg">
                  Level {character.level} {character.avatar.charAt(0).toUpperCase() + character.avatar.slice(1)}
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div>
                <div className="text-gray-300 text-sm">Gold</div>
                <div className="text-yellow-400 text-2xl font-bold">💰 {character.gold || 0}</div>
              </div>
              <div>
                <div className="text-gray-300 text-sm">Total Study Time</div>
                <div className="text-white text-2xl font-bold">{character.totalStudyTime} min</div>
              </div>
            </div>
          </div>
          
          {/* XP Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Experience Points</span>
              <span className="font-semibold">{character.xp} / {xpForNextLevel} XP</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-6 overflow-hidden border border-white/20">
              <div
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
                style={{ width: `${xpPercentage}%` }}
              >
                {xpPercentage > 10 && (
                  <span className="text-white text-xs font-bold">{Math.floor(xpPercentage)}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-500/20 p-4 rounded-lg text-center border border-blue-400/30">
              <div className="text-blue-300 text-3xl font-bold">{character.stats.focus}</div>
              <div className="text-gray-300 text-sm mt-1">Focus</div>
            </div>
            <div className="bg-purple-500/20 p-4 rounded-lg text-center border border-purple-400/30">
              <div className="text-purple-300 text-3xl font-bold">{character.stats.knowledge}</div>
              <div className="text-gray-300 text-sm mt-1">Knowledge</div>
            </div>
            <div className="bg-green-500/20 p-4 rounded-lg text-center border border-green-400/30">
              <div className="text-green-300 text-3xl font-bold">{character.stats.discipline}</div>
              <div className="text-gray-300 text-sm mt-1">Discipline</div>
            </div>
          </div>
        </div>

        {/* Study Timer */}
        <div className="mb-6">
          <StudyTimer 
            user={user} 
            character={character}
            onSessionComplete={handleSessionComplete}
          />
        </div>

        {/* Study Statistics */}
        <div className="mb-6">
          <StudyStats userId={user?.id} />
        </div>

        {/* Session History */}
        <div className="mb-6">
          <SessionHistory userId={user?.id} />
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <Achievements userId={user?.id} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;