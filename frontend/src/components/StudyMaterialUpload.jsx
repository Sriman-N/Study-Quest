import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import axios from 'axios';

const StudyMaterialUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setTitle(selectedFile.name.replace('.pdf', ''));
      setError('');
    } else {
      setError('Please select a PDF file');
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file || !subject) {
      setError('Please select a file and enter a subject');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('title', title);
      formData.append('subject', subject);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/study-materials/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Reset form
      setFile(null);
      setTitle('');
      setSubject('');
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.material);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Upload className="w-6 h-6 text-blue-500" />
        Upload Study Material
      </h2>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            {file ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <FileText className="w-8 h-8" />
                <span className="font-medium">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setFile(null);
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Click to upload PDF</p>
                <p className="text-sm text-gray-400">Max size: 10MB</p>
              </div>
            )}
          </label>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Chapter 5 - Calculus"
          />
        </div>

        {/* Subject Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Mathematics, Physics, History"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {uploading ? 'Uploading...' : 'Upload Study Material'}
        </button>
      </form>
    </div>
  );
};

export default StudyMaterialUpload;