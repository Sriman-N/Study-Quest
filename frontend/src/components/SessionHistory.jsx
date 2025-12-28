import { useState, useEffect } from 'react';
import axios from 'axios';

const SessionHistory = ({ userId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`/api/sessions/user/${userId}`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    if (filter === 'today') {
      return sessions.filter(s => new Date(s.completedAt) >= today);
    } else if (filter === 'week') {
      return sessions.filter(s => new Date(s.completedAt) >= weekAgo);
    }
    return sessions;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTotalStats = () => {
    const filtered = filterSessions();
    return {
      totalSessions: filtered.length,
      totalMinutes: filtered.reduce((sum, s) => sum + s.duration, 0),
      totalXP: filtered.reduce((sum, s) => sum + s.xpEarned, 0)
    };
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <p className="text-white text-center">Loading sessions...</p>
      </div>
    );
  }

  const filteredSessions = filterSessions();
  const stats = getTotalStats();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">📝 Study History</h3>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'week' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filter === 'today' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-400/30 text-center">
          <div className="text-blue-300 text-2xl font-bold">{stats.totalSessions}</div>
          <div className="text-gray-300 text-sm">Sessions</div>
        </div>
        <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-400/30 text-center">
          <div className="text-purple-300 text-2xl font-bold">{stats.totalMinutes}</div>
          <div className="text-gray-300 text-sm">Minutes</div>
        </div>
        <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-400/30 text-center">
          <div className="text-yellow-300 text-2xl font-bold">{stats.totalXP}</div>
          <div className="text-gray-300 text-sm">XP Earned</div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No study sessions yet.</p>
            <p className="text-gray-500 text-sm mt-2">Complete a study session to see it here!</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session._id}
              className="bg-white/10 p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📚</span>
                    <h4 className="text-white font-semibold">{session.subject}</h4>
                  </div>
                  <p className="text-gray-400 text-sm">{formatDate(session.completedAt)}</p>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-lg">+{session.xpEarned} XP</div>
                  <div className="text-gray-400 text-sm">{session.duration} min</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionHistory;