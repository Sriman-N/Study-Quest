import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CharacterCreation = () => {
  const [characterName, setCharacterName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('warrior');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const avatars = [
    { id: 'warrior', name: 'Warrior', emoji: '⚔️', description: 'Strong and disciplined' },
    { id: 'mage', name: 'Mage', emoji: '🧙', description: 'Wise and focused' },
    { id: 'scholar', name: 'Scholar', emoji: '📚', description: 'Knowledgeable and studious' },
    { id: 'ninja', name: 'Ninja', emoji: '🥷', description: 'Swift and dedicated' },
  ];

  const handleCreate = async () => {
    if (!characterName.trim()) {
      setError('Please enter a character name');
      return;
    }

    if (characterName.length < 3) {
      setError('Character name must be at least 3 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/characters', {
        name: characterName,
        avatar: selectedAvatar
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Create character error:', err);
      setError(err.response?.data?.message || 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Create Your Character
          </h2>
          <p className="text-gray-300">
            Choose your study companion and begin your quest!
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Character Name */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Character Name
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-300/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your hero's name"
              maxLength={30}
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-white text-sm font-medium mb-4">
              Choose Your Class
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`p-6 rounded-lg transition-all transform hover:scale-105 ${
                    selectedAvatar === avatar.id
                      ? 'bg-indigo-600 ring-4 ring-indigo-400 scale-105'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className="text-5xl mb-2">{avatar.emoji}</div>
                  <div className="text-white font-semibold text-sm">{avatar.name}</div>
                  <div className="text-gray-300 text-xs mt-1">{avatar.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Starting Stats */}
          <div className="bg-white/20 p-6 rounded-lg border border-white/30">
            <h3 className="text-white font-semibold mb-3 text-lg">Starting Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-blue-300 text-2xl font-bold">1</div>
                <div className="text-gray-300 text-sm">Focus</div>
              </div>
              <div className="text-center">
                <div className="text-purple-300 text-2xl font-bold">1</div>
                <div className="text-gray-300 text-sm">Knowledge</div>
              </div>
              <div className="text-center">
                <div className="text-green-300 text-2xl font-bold">1</div>
                <div className="text-gray-300 text-sm">Discipline</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between text-gray-300 text-sm">
                <span>Starting Level:</span>
                <span className="text-white font-bold">Level 1</span>
              </div>
              <div className="flex justify-between text-gray-300 text-sm mt-2">
                <span>Starting XP:</span>
                <span className="text-white font-bold">0 / 100</span>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={!characterName || loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            {loading ? 'Creating Character...' : 'Begin Your Quest! 🎮'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;