import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CharacterCreation from './pages/CharacterCreation';
import StudyMaterials from './pages/StudyMaterials';
import Shop from './pages/Shop';
import Inventory from './pages/Inventory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-character" element={<CharacterCreation />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/study-materials" element={<StudyMaterials />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;