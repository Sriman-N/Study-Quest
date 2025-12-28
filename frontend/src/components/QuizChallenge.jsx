import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, Trophy } from 'lucide-react';

const QuizChallenge = ({ challenge, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < challenge.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswers.length !== challenge.questions.length) {
      alert('Please answer all questions before submitting');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/daily-challenges/${challenge._id}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ answers: selectedAnswers })
        }
      );

      const data = await response.json();
      setResults(data);
      setShowResults(true);

      if (onComplete) {
        onComplete(data);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    }
  };

  if (showResults && results) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-xl text-gray-700">
            Score: {results.score}% ({results.correctCount}/{results.totalQuestions} correct)
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-lg mb-3">Rewards Earned:</h3>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">+{results.rewards.xp}</p>
              <p className="text-sm text-gray-600">XP</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">+{results.rewards.gold}</p>
              <p className="text-sm text-gray-600">Gold</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Review Answers:</h3>
          {challenge.questions.map((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-1" />
                  )}
                  <p className="font-semibold">{question.question}</p>
                </div>

                <div className="ml-7 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Your answer:</span>{' '}
                    <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                      {question.options[userAnswer]}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-sm">
                      <span className="font-medium">Correct answer:</span>{' '}
                      <span className="text-green-700">
                        {question.options[question.correctAnswer]}
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-gray-600 italic mt-2">{question.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const question = challenge.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / challenge.questions.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            {challenge.title}
          </h2>
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {challenge.questions.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-lg font-semibold mb-4">{question.question}</p>
        
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestion] === index && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentQuestion === challenge.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswers.length !== challenge.questions.length}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizChallenge;