import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Study Quest Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Logout
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Welcome, {user?.username || 'Hero'}! 🎮
          </h2>
          <p className="text-gray-300">
            Your study adventure begins here. We'll add more features soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;