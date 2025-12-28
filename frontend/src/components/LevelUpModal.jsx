const LevelUpModal = ({ show, newLevel, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 rounded-2xl animate-scaleIn">
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-2xl text-center">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-5xl font-bold text-yellow-400 mb-2">LEVEL UP!</h2>
          <p className="text-white text-3xl mb-6">You reached Level {newLevel}!</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm mb-2">Stats Increased!</p>
            <div className="flex justify-center gap-6">
              <div>
                <div className="text-blue-400 text-2xl font-bold">+1</div>
                <div className="text-gray-300 text-xs">Focus</div>
              </div>
              <div>
                <div className="text-purple-400 text-2xl font-bold">+1</div>
                <div className="text-gray-300 text-xs">Knowledge</div>
              </div>
              <div>
                <div className="text-green-400 text-2xl font-bold">+1</div>
                <div className="text-gray-300 text-xs">Discipline</div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Continue Your Quest!
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;