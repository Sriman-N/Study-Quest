import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FileText, Trash2, Sparkles } from 'lucide-react';
import axios from 'axios';

const StudyMaterialsList = forwardRef(({ onGenerateQuiz, onSelectionChange }, ref) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Notify parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedMaterials);
    }
  }, [selectedMaterials, onSelectionChange]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
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

  // Expose the refresh method to parent component
  useImperativeHandle(ref, () => ({
    refreshMaterials: fetchMaterials
  }));

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/study-materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(materials.filter(m => m._id !== id));
      setSelectedMaterials(selectedMaterials.filter(materialId => materialId !== id));
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
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-500" />
          Your Study Materials ({materials.length})
          {selectedMaterials.length > 0 && (
            <span className="text-sm font-normal text-purple-600">
              • {selectedMaterials.length} selected
            </span>
          )}
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
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p>No study materials uploaded yet. Upload your first PDF to get started!</p>
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
});

StudyMaterialsList.displayName = 'StudyMaterialsList';

export default StudyMaterialsList;