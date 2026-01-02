import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const StudyStats = ({ userId }) => {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          axios.get(`/api/sessions/stats/${userId}`),
          axios.get(`/api/sessions/user/${userId}`)
        ]);
        setStats(statsRes.data);
        setSessions(sessionsRes.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

  fetchData();
}, [userId]);

  const getWeeklyData = () => {
    const last7Days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const minutesStudied = sessions
        .filter(s => {
          const sessionDate = new Date(s.completedAt);
          return sessionDate >= dayStart && sessionDate <= dayEnd;
        })
        .reduce((sum, s) => sum + s.duration, 0);
      
      last7Days.push({
        day: dayName,
        minutes: minutesStudied,
        hours: (minutesStudied / 60).toFixed(1)
      });
    }
    
    return last7Days;
  };

  const getSubjectData = () => {
    if (!stats || !stats.subjectBreakdown) return [];
    
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#10b981', // green
      '#f59e0b', // orange
      '#ef4444', // red
      '#06b6d4', // cyan
      '#ec4899', // pink
    ];
    
    return Object.entries(stats.subjectBreakdown).map(([subject, minutes], index) => ({
      name: subject,
      value: minutes,
      percentage: ((minutes / stats.totalMinutes) * 100).toFixed(1),
      color: colors[index % colors.length]
    }));
  };

  const getStreakInfo = () => {
    if (sessions.length === 0) return { current: 0, longest: 0 };
    
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.completedAt) - new Date(a.completedAt)
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(sortedSessions[0].completedAt);
    lastDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if studied today or yesterday for current streak
    if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
      currentStreak = 1;
      
      for (let i = 1; i < sortedSessions.length; i++) {
        const sessionDate = new Date(sortedSessions[i].completedAt);
        sessionDate.setHours(0, 0, 0, 0);
        
        const dayDiff = Math.floor((lastDate - sessionDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          currentStreak++;
          lastDate = sessionDate;
        } else if (dayDiff > 1) {
          break;
        }
      }
    }
    
    // Calculate longest streak
    lastDate = new Date(sortedSessions[0].completedAt);
    lastDate.setHours(0, 0, 0, 0);
    
    for (let i = 1; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((lastDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (dayDiff > 1) {
        tempStreak = 1;
      }
      
      lastDate = sessionDate;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    
    return { current: currentStreak, longest: longestStreak };
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <p className="text-white text-center">Loading statistics...</p>
      </div>
    );
  }

  if (!stats || sessions.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-4">📊 Study Statistics</h3>
        <p className="text-gray-400 text-center py-8">Complete some study sessions to see your stats!</p>
      </div>
    );
  }

  const weeklyData = getWeeklyData();
  const subjectData = getSubjectData();
  const streakInfo = getStreakInfo();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">📊 Study Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-lg border border-blue-400/30">
            <div className="text-blue-300 text-3xl font-bold">{stats.totalSessions}</div>
            <div className="text-gray-300 text-sm">Total Sessions</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 rounded-lg border border-purple-400/30">
            <div className="text-purple-300 text-3xl font-bold">{Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m</div>
            <div className="text-gray-300 text-sm">Total Time</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-4 rounded-lg border border-yellow-400/30">
            <div className="text-yellow-300 text-3xl font-bold">{stats.totalXP}</div>
            <div className="text-gray-300 text-sm">Total XP</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 rounded-lg border border-green-400/30">
            <div className="text-green-300 text-3xl font-bold">{Math.round(stats.totalMinutes / stats.totalSessions)}</div>
            <div className="text-gray-300 text-sm">Avg. Session (min)</div>
          </div>
        </div>

        {/* Streak Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-400/30 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-orange-300 text-2xl font-bold">{streakInfo.current} Days</div>
            <div className="text-gray-300 text-sm">Current Streak</div>
          </div>
          
          <div className="bg-red-500/20 p-4 rounded-lg border border-red-400/30 text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-red-300 text-2xl font-bold">{streakInfo.longest} Days</div>
            <div className="text-gray-300 text-sm">Longest Streak</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h4 className="text-xl font-bold text-white mb-4">Last 7 Days</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="day" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="minutes" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h4 className="text-xl font-bold text-white mb-4">Study by Subject</h4>
          {subjectData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => {
                      const RADIAN = Math.PI / 180;
                      const { cx, cy, midAngle, outerRadius, percentage } = entry;
                      const radius = outerRadius + 30;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'
                          }}
                        >
                          {`${percentage}%`}
                        </text>
                      );
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    itemStyle={{ color: 'white' }}
                    labelStyle={{ color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {subjectData.map((subject) => (
                  <div key={subject.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="text-white text-sm">{subject.name}</span>
                    </div>
                    <span className="text-gray-300 text-sm">{subject.value} min</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-8">No subject data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyStats;