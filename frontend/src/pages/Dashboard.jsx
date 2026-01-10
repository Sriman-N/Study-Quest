import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudyTimer from '../components/StudyTimer';
import SessionHistory from '../components/SessionHistory';
import StudyStats from '../components/StudyStats';
import Achievements from '../components/Achievements';
import { BookOpen, ShoppingBag, Coins, Package } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [equippedItems, setEquippedItems] = useState({
    avatar: null,
    background: null,
    title: null
  });

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
    const characterResponse = await axios.get('http://localhost:5000/api/characters', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setCharacter(characterResponse.data);
    
    // Set a basic user object from token
    setUser({ id: characterResponse.data.userId });

    // Fetch equipped items
    try {
      const inventoryResponse = await axios.get('http://localhost:5000/api/shop/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Inventory response:', inventoryResponse.data); // Debug log

      // Build equipped items from inventory data
      const equipped = {
        avatar: null,
        background: null,
        title: null
      };

      // Match equipped itemIds with itemDetails
      if (inventoryResponse.data.equipped && inventoryResponse.data.itemDetails) {
        const { equipped: equippedIds, itemDetails } = inventoryResponse.data;

        // Find background
        if (equippedIds.background) {
          equipped.background = itemDetails.find(item => item.itemId === equippedIds.background);
        }

        // Find avatar
        if (equippedIds.avatar) {
          equipped.avatar = itemDetails.find(item => item.itemId === equippedIds.avatar);
        }

        // Find title
        if (equippedIds.title) {
          equipped.title = itemDetails.find(item => item.itemId === equippedIds.title);
        }
      }

      console.log('Parsed equipped items:', equipped); // Debug log
      setEquippedItems(equipped);
    } catch (invError) {
      console.error('Error fetching inventory:', invError);
      // Continue even if inventory fails
    }
    
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
    dragon: '🐉',
    wizard: '🧙‍♂️',
    robot: '🤖',
    alien: '👽',
    knight: '🛡️',
    pirate: '🏴‍☠️'
  };

  // Use equipped avatar if available, otherwise default
  const displayAvatar = equippedItems.avatar?.image || avatarEmojis[character.avatar] || '⚔️';

  const xpForNextLevel = Math.floor(100 * Math.pow(1.5, character.level - 1));
  const xpPercentage = (character.xp / xpForNextLevel) * 100;

  // Background style - create a decorative background with the emoji
  const getBackgroundStyle = () => {
    if (equippedItems.background) {
      return {
        background: `linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(59, 130, 246, 0.95), rgba(99, 102, 241, 0.95))`,
        position: 'relative'
      };
    }
    return {};
  };

  return (
    <div 
      className="min-h-screen p-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"
      style={getBackgroundStyle()}
    >
      {/* Background emoji decoration if equipped */}
      {equippedItems.background && (
        <div 
          className="fixed inset-0 pointer-events-none overflow-hidden opacity-60"
          style={{ zIndex: 0 }}
        >
          {/* Scattered large emojis */}
          <div className="absolute top-10 left-10 text-[18rem] filter drop-shadow-2xl">
            {equippedItems.background.image}
          </div>
          <div className="absolute top-20 right-20 text-[18rem] filter drop-shadow-2xl">
            {equippedItems.background.image}
          </div>
          <div className="absolute bottom-20 left-1/4 text-[18rem] filter drop-shadow-2xl">
            {equippedItems.background.image}
          </div>
          <div className="absolute bottom-32 right-1/4 text-[18rem] filter drop-shadow-2xl">
            {equippedItems.background.image}
          </div>
          <div className="absolute top-1/3 left-1/2 text-[18rem] filter drop-shadow-2xl">
            {equippedItems.background.image}
          </div>
          
          {/* Giant center emoji */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[35rem] opacity-40 filter drop-shadow-2xl">
            {equippedItems.background.image}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Study Quest</h1>
          <div className="flex gap-4">
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
              <div className="text-7xl">{displayAvatar}</div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-1">
                  {character.name}
                  {equippedItems.title && (
                    <span className="ml-3 text-2xl text-yellow-300">
                      {equippedItems.title.image}
                    </span>
                  )}
                </h2>
                <p className="text-gray-300 text-lg">
                  Level {character.level} {character.avatar.charAt(0).toUpperCase() + character.avatar.slice(1)}
                </p>
                {equippedItems.title && (
                  <p className="text-yellow-300 text-sm mt-1">
                    "{equippedItems.title.name}"
                  </p>
                )}
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

        {/* Shop & Inventory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shop Card */}
          <div 
            onClick={() => navigate('/shop')}
            className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-2xl shadow-2xl p-8 cursor-pointer hover:shadow-3xl transition-all transform hover:scale-105 border-2 border-yellow-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-3xl font-bold text-white">Item Shop</h3>
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <p className="text-yellow-100 mb-6 text-lg">
              Spend your hard-earned gold on avatars, backgrounds, titles, and power-ups!
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <Coins className="w-6 h-6" />
                <span className="font-bold text-xl">{character?.gold || 0} Gold</span>
              </div>
              <div className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold text-lg">
                Browse →
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div 
            onClick={() => navigate('/inventory')}
            className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl shadow-2xl p-8 cursor-pointer hover:shadow-3xl transition-all transform hover:scale-105 border-2 border-purple-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-3xl font-bold text-white">My Inventory</h3>
              <Package className="w-10 h-10 text-white" />
            </div>
            <p className="text-purple-100 mb-6 text-lg">
              View and equip your collected items. Customize your character!
            </p>
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="text-sm text-purple-200">Equipped Items</div>
                <div className="flex gap-2 mt-2">
                  <span className="text-2xl">{equippedItems.avatar?.image || '❌'}</span>
                  <span className="text-2xl">{equippedItems.background?.image || '❌'}</span>
                  <span className="text-2xl">{equippedItems.title?.image || '❌'}</span>
                </div>
              </div>
              <div className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold text-lg">
                View →
              </div>
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