import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CharacterCreation from './pages/CharacterCreation';
import StudyMaterials from './pages/StudyMaterials';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-character" element={<CharacterCreation />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/study-materials" element={<StudyMaterials />} />
      </Routes>
    </Router>
  );
}

export default App;