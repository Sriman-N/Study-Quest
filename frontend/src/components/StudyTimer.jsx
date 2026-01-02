
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LevelUpModal from './LevelUpModal';
import AchievementModal from './AchievementModal';

const StudyTimer = ({ user, character, onSessionComplete }) => {
  const [studyDuration, setStudyDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [subject, setSubject] = useState('');
  const [showSubjectInput, setShowSubjectInput] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const intervalRef = useRef(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

useEffect(() => {
  if (isActive && timeLeft > 0) {
    intervalRef.current = setInterval(() => {
      setTimeLeft(time => {
        if (time <= 1) {
          // Timer is about to hit 0
          setIsActive(false);
          setTimerComplete(true);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  }
  
  return () => clearInterval(intervalRef.current);
}, [isActive, timeLeft]);
  useEffect(() => {
    if (!timerComplete) return;

    const handleCompletion = async () => {
      if (!isBreak) {
        try {
          const response = await axios.post('/api/sessions', {
            userId: user.id,
            characterId: character._id,
            subject: subject || 'General Study',
            duration: studyDuration
          });

          if (onSessionComplete) {
            onSessionComplete();
          }

          if (response.data.leveledUp) {
            setNewLevel(response.data.newLevel);
            setShowLevelUpModal(true);
          }

          if (response.data.newAchievements && response.data.newAchievements.length > 0) {
            setUnlockedAchievements(response.data.newAchievements);
            setShowAchievementModal(true);
          } else if (!response.data.leveledUp) {
            alert(`🎉 Study session complete! +${studyDuration} XP earned!`);
          }
        } catch (error) {
          console.error('Error saving session:', error);
          alert('Session completed but failed to save. Please try again.');
        }

        setIsBreak(true);
        setTimeLeft(breakDuration * 60);
        setIsActive(true);
      } else {
        alert('Break time over! Ready for another study session?');
        setIsBreak(false);
        setTimeLeft(studyDuration * 60);
        setShowSubjectInput(true);
      }

      setTimerComplete(false);
    };

    handleCompletion();
  }, [timerComplete, isBreak, user.id, character._id, subject, studyDuration, breakDuration, onSessionComplete]);

  const startTimer = () => {
    if (!subject.trim() && !isBreak) {
      alert('Please enter what you\'re studying!');
      return;
    }
    setShowSubjectInput(false);
    setShowSettings(false);
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(studyDuration * 60);
    setSubject('');
    setShowSubjectInput(true);
  };

  const applySettings = () => {
    if (!isActive) {
      setTimeLeft(studyDuration * 60);
    }
    setShowSettings(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = isBreak ? breakDuration * 60 : studyDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <div className="text-center">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-3xl font-bold text-white">
            {isBreak ? '☕ Break Time' : '📚 Study Session'}
          </h3>
          {!isActive && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              ⚙️ Settings
            </button>
          )}
        </div>
        
        <p className="text-gray-300 mb-6">
          {isBreak ? 'Relax and recharge!' : 'Focus and earn XP!'}
        </p>

        {showSettings && !isActive && (
          <div className="mb-6 bg-indigo-900/40 p-6 rounded-lg border border-indigo-500/30">
            <h4 className="text-white font-semibold mb-4">Timer Settings</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Study Duration (min)</label>
                <input
                  type="number"
                  value={studyDuration}
                  onChange={(e) => setStudyDuration(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white text-center border border-gray-300/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="120"
                />
                <p className="text-gray-400 text-xs mt-1">1-120 minutes</p>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Break Duration (min)</label>
                <input
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white text-center border border-gray-300/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="30"
                />
                <p className="text-gray-400 text-xs mt-1">1-30 minutes</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setStudyDuration(25); setBreakDuration(5); }}
                className="flex-1 px-3 py-2 bg-green-600/30 hover:bg-green-600/50 text-white rounded text-sm border border-green-500/30"
              >
                Pomodoro (25/5)
              </button>
              <button
                onClick={() => { setStudyDuration(50); setBreakDuration(10); }}
                className="flex-1 px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-white rounded text-sm border border-blue-500/30"
              >
                Long (50/10)
              </button>
              <button
                onClick={() => { setStudyDuration(15); setBreakDuration(3); }}
                className="flex-1 px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-white rounded text-sm border border-purple-500/30"
              >
                Short (15/3)
              </button>
            </div>

            <button
              onClick={applySettings}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
            >
              Apply Settings
            </button>
          </div>
        )}

        {showSubjectInput && !isBreak && !showSettings && (
          <div className="mb-6">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What are you studying?"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-300/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
              maxLength={50}
            />
          </div>
        )}

        <div className="mb-6">
          <div className="text-8xl font-bold text-white mb-4 font-mono">
            {formatTime(timeLeft)}
          </div>
          
          <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden border border-white/20">
            <div
              className={`h-4 rounded-full transition-all duration-1000 ${
                isBreak ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gradient-to-r from-orange-400 to-pink-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!showSubjectInput && !isBreak && subject && (
          <div className="mb-6 bg-indigo-600/30 rounded-lg p-3 border border-indigo-400/30">
            <p className="text-gray-300 text-sm">Studying:</p>
            <p className="text-white font-semibold">{subject}</p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          {!isActive ? (
            <button
              onClick={startTimer}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              {timeLeft === totalTime ? 'Start' : 'Resume'}
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Pause
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Reset
          </button>
        </div>

        {!isBreak && (
          <div className="mt-6 text-gray-300 text-sm">
            Complete this session to earn <span className="text-yellow-400 font-bold">+{studyDuration} XP</span>
          </div>
        )}
      </div>

      {/* Level Up Modal */}
      <LevelUpModal 
        show={showLevelUpModal} 
        newLevel={newLevel}
        onClose={() => setShowLevelUpModal(false)}
      />

      {/* Achievement Modal */}
      <AchievementModal 
        show={showAchievementModal} 
        achievements={unlockedAchievements}
        onClose={() => {
          setShowAchievementModal(false);
          if (newLevel) {
            setShowLevelUpModal(true);
          }
        }}
      />
    </div>
  );
};

export default StudyTimer;