import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudyMaterialUpload from '../components/StudyMaterialUpload';
import StudyMaterialsList from '../components/StudyMaterialsList';
import AIStudyAssistant from '../components/AIStudyAssistant';
import QuizChallenge from '../components/QuizChallenge';
import { BookOpen, ArrowLeft } from 'lucide-react';

const StudyMaterials = () => {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);
  const navigate = useNavigate();
  
  const materialsListRef = useRef(null);

  const handleUploadSuccess = () => {
    if (materialsListRef.current) {
      materialsListRef.current.refreshMaterials();
    }
  };

  const handleGenerateQuiz = async (selectedMaterialIds) => {
    setGenerating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/daily-challenges/generate-quiz',
        {
          materialIds: selectedMaterialIds,
          difficulty: difficulty
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setActiveQuiz(response.data);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleQuizComplete = (results) => {
    console.log('Quiz completed with results:', results);
    setTimeout(() => {
      setActiveQuiz(null);
    }, 5000);
  };

  const handleMaterialSelectionChange = (selectedIds) => {
    setSelectedMaterialIds(selectedIds);
  };

  if (activeQuiz) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setActiveQuiz(null)}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Materials
          </button>
          <QuizChallenge challenge={activeQuiz} onComplete={handleQuizComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Study Materials & AI Assistant</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        {generating && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-purple-700 font-medium">Generating your AI quiz...</p>
            <p className="text-sm text-purple-600">This may take 10-20 seconds</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <StudyMaterialUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <h2 className="text-xl font-bold mb-4">Quiz Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="easy">Easy - 30 XP, 5 Gold</option>
                  <option value="medium">Medium - 50 XP, 10 Gold</option>
                  <option value="hard">Hard - 80 XP, 20 Gold</option>
                </select>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> Upload your lecture PDFs, select the materials you want to study, 
                  and use the AI tools below to generate quizzes, get explanations, or create study guides!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <StudyMaterialsList 
            ref={materialsListRef}
            onGenerateQuiz={handleGenerateQuiz}
            onSelectionChange={handleMaterialSelectionChange}
          />
        </div>

        <div>
          <AIStudyAssistant selectedMaterials={selectedMaterialIds} />
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;