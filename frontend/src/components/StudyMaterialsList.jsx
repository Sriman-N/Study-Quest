import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Sparkles } from 'lucide-react';
import axios from 'axios';

const StudyMaterialsList = ({ onGenerateQuiz }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/study-materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/study-materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(materials.filter(m => m._id !== id));
      setSelectedMaterials(selectedMaterials.filter(id => id !== id));
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const toggleSelection = (id) => {
    setSelectedMaterials(prev =>
      prev.includes(id)
        ? prev.filter(materialId => materialId !== id)
        : [...prev, id]
    );
  };

  const handleGenerateQuiz = () => {
    if (selectedMaterials.length > 0 && onGenerateQuiz) {
      onGenerateQuiz(selectedMaterials);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading materials...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-500" />
          Your Study Materials ({materials.length})
        </h2>
        
        {selectedMaterials.length > 0 && (
          <button
            onClick={handleGenerateQuiz}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Generate Quiz ({selectedMaterials.length})
          </button>
        )}
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No study materials uploaded yet. Upload your first PDF to get started!
        </div>
      ) : (
        <div className="space-y-2">
          {materials.map((material) => (
            <div
              key={material._id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedMaterials.includes(material._id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleSelection(material._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedMaterials.includes(material._id)}
                    onChange={() => {}}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-800">{material.title}</p>
                    <p className="text-sm text-gray-500">
                      {material.subject} • {new Date(material.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(material._id);
                  }}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyMaterialsList;