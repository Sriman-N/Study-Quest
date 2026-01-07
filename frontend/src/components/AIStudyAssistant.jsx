import React, { useState } from 'react';
import { Brain, MessageSquare, BookOpen, HelpCircle, Sparkles, Download, X } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const AIStudyAssistant = ({ selectedMaterials = [] }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  // Practice questions state
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [questionCount, setQuestionCount] = useState(5);
  const [questionDifficulty, setQuestionDifficulty] = useState('medium');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Concept explanation state
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  
  // Study guide state
  const [studyGuide, setStudyGuide] = useState('');

  // Generate Practice Questions
  const handleGeneratePracticeQuestions = async () => {
    if (selectedMaterials.length === 0) {
      alert('Please select at least one study material first');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/ai-assistant/practice-questions',
        {
          materialIds: selectedMaterials,
          count: questionCount,
          difficulty: questionDifficulty
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPracticeQuestions(response.data.questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } catch (error) {
      console.error('Error generating questions:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to generate practice questions';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Explain Concept
  const handleExplainConcept = async () => {
    if (!concept.trim()) {
      alert('Please enter a concept to explain');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/ai-assistant/explain-concept',
        {
          concept: concept,
          materialIds: selectedMaterials
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExplanation(response.data.explanation);
    } catch (error) {
      console.error('Error explaining concept:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to explain concept';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Generate Study Guide
  const handleGenerateStudyGuide = async () => {
    if (selectedMaterials.length === 0) {
      alert('Please select at least one study material first');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/ai-assistant/study-guide',
        {
          materialIds: selectedMaterials,
          includeQuestions: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudyGuide(response.data.studyGuide);
    } catch (error) {
      console.error('Error generating study guide:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to generate study guide';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Chat with AI
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    const currentInput = chatInput;
    setChatInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/ai-assistant/chat',
        {
          message: currentInput,
          materialIds: selectedMaterials,
          conversationHistory: chatMessages
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      const aiMessage = { role: 'assistant', content: response.data.response };
      setChatMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error('=== CHAT ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('==================');
      
      const errorMsg = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to send message';
      
      alert(`Error: ${errorMsg}`);
      
      // Revert to previous messages if failed
      setChatMessages(chatMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const downloadStudyGuide = () => {
    const element = document.createElement('a');
    const file = new Blob([studyGuide], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'study-guide.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-8 h-8 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-800">AI Study Assistant</h2>
      </div>
      {selectedMaterials.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Using {selectedMaterials.length} selected material(s)</strong>
        </div>
      )}
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'practice'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <HelpCircle className="w-4 h-4 inline mr-2" />
          Practice Questions
        </button>
        <button
          onClick={() => setActiveTab('explain')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'explain'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Explain Concept
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'guide'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Study Guide
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-3 bg-gray-50">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Start a conversation with your AI study assistant!</p>
                <p className="text-sm mt-2">Ask questions, request explanations, or get study tips.</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-purple-100 ml-12'
                      : 'bg-white mr-12 border'
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))
            )}
            {loading && (
              <div className="bg-white p-3 rounded-lg mr-12 border">
                <p className="text-sm font-semibold mb-1">AI Assistant</p>
                <p className="text-gray-500">Thinking...</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
              placeholder="Ask a question about your study materials..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !chatInput.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Practice Questions Tab */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          {practiceQuestions.length === 0 ? (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={questionDifficulty}
                    onChange={(e) => setQuestionDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleGeneratePracticeQuestions}
                disabled={loading || selectedMaterials.length === 0}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 font-medium"
              >
                {loading ? 'Generating...' : 'Generate Practice Questions'}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {practiceQuestions.length}
                </span>
                <button
                  onClick={() => setPracticeQuestions([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 inline" /> Exit Practice
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {practiceQuestions[currentQuestionIndex].question}
                </h3>

                <div className="space-y-2 mb-4">
                  {practiceQuestions[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      disabled={showExplanation}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        showExplanation
                          ? idx === practiceQuestions[currentQuestionIndex].correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : idx === selectedAnswer
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                          : selectedAnswer === idx
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {showExplanation && (
                  <div className={`p-4 rounded-lg ${
                    selectedAnswer === practiceQuestions[currentQuestionIndex].correctAnswer
                      ? 'bg-green-50 border-2 border-green-500'
                      : 'bg-red-50 border-2 border-red-500'
                  }`}>
                    <p className="font-semibold mb-2">
                      {selectedAnswer === practiceQuestions[currentQuestionIndex].correctAnswer
                        ? '✅ Correct!'
                        : '❌ Incorrect'}
                    </p>
                    <p className="text-sm">
                      {practiceQuestions[currentQuestionIndex].explanation}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === practiceQuestions.length - 1}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explain Concept Tab */}
      {activeTab === 'explain' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleExplainConcept()}
              placeholder="Enter a concept to explain (e.g., photosynthesis, quadratic equations)"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleExplainConcept}
              disabled={loading || !concept.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? 'Explaining...' : 'Explain'}
            </button>
          </div>

          {explanation && (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Explanation: {concept}
              </h3>
              <div className="prose max-w-none">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Study Guide Tab */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          {!studyGuide ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">
                Generate a comprehensive study guide from your selected materials
              </p>
              <button
                onClick={handleGenerateStudyGuide}
                disabled={loading || selectedMaterials.length === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 font-medium"
              >
                {loading ? 'Generating Study Guide...' : 'Generate Study Guide'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Your Study Guide</h3>
                <div className="flex gap-2">
                  <button
                    onClick={downloadStudyGuide}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => setStudyGuide('')}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    New Guide
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border prose max-w-none">
                <ReactMarkdown>{studyGuide}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIStudyAssistant;