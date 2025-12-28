const AchievementModal = ({ show, achievements, onClose }) => {
  if (!show || !achievements || achievements.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 rounded-2xl animate-scaleIn max-w-md w-full mx-4">
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">
              Achievement{achievements.length > 1 ? 's' : ''} Unlocked!
            </h2>
            
            {/* Achievement List */}
            <div className="space-y-4 mb-6">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-lg p-4 border border-yellow-400/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="text-left flex-1">
                      <h3 className="text-yellow-400 font-bold">{achievement.title}</h3>
                      <p className="text-gray-300 text-sm">{achievement.description}</p>
                      <p className="text-green-400 text-sm font-semibold mt-1">
                        +{achievement.xpReward} XP
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Awesome!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;