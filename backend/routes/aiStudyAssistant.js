const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudyMaterial = require('../models/StudyMaterial');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate practice questions from materials
router.post('/practice-questions', auth, async (req, res) => {
  try {
    const { materialIds, count = 5, difficulty = 'medium' } = req.body;

    if (!materialIds || materialIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one material' });
    }

    const materials = await StudyMaterial.find({
      _id: { $in: materialIds },
      userId: req.userId
    });

    if (materials.length === 0) {
      return res.status(404).json({ message: 'Materials not found' });
    }

    const combinedText = materials.map(m => m.extractedText).join('\n\n');
    const topics = materials.map(m => m.subject).join(', ');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'user',
        content: `Based on the following study materials about ${topics}, generate ${count} practice questions with difficulty level: ${difficulty}.

Study Materials:
${combinedText.substring(0, 15000)} 

Create questions based on the topics covered in the material. Use your knowledge to make them educational and comprehensive.

Please provide questions in the following JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "multiple_choice",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": 0,
      "explanation": "Comprehensive explanation of why this answer is correct"
    }
  ]
}

Make the questions ${difficulty} difficulty. Return ONLY the JSON, no additional text.`
      }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const questionsData = JSON.parse(completion.choices[0].message.content);

    res.json({
      questions: questionsData.questions,
      topics: topics,
      difficulty: difficulty
    });

  } catch (error) {
    console.error('Practice questions error:', error);
    res.status(500).json({ 
      message: 'Failed to generate practice questions', 
      error: error.message 
    });
  }
});

// Explain a concept from materials
router.post('/explain-concept', auth, async (req, res) => {
  try {
    const { concept, materialIds } = req.body;

    if (!concept) {
      return res.status(400).json({ message: 'Please provide a concept to explain' });
    }

    let context = '';
    
    if (materialIds && materialIds.length > 0) {
      const materials = await StudyMaterial.find({
        _id: { $in: materialIds },
        userId: req.userId
      });
      
      if (materials.length > 0) {
        context = materials.map(m => m.extractedText).join('\n\n').substring(0, 10000);
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'user',
        content: context 
          ? `Based on the following study materials, explain the concept: "${concept}"

Study Materials Context:
${context}

Please provide:
1. A clear, concise explanation
2. Real-world examples or analogies
3. Key points to remember
4. Common misconceptions (if any)

Use the material as a foundation but feel free to expand with additional helpful context. Format your response in a student-friendly way with proper structure and formatting.`
          : `Explain the concept: "${concept}"

Please provide:
1. A clear, concise explanation
2. Real-world examples or analogies
3. Key points to remember
4. Common misconceptions (if any)

Format your response in a student-friendly way with proper structure and formatting.`
      }],
      temperature: 0.7,
      max_tokens: 1500
    });

    const explanation = completion.choices[0].message.content;

    res.json({
      concept: concept,
      explanation: explanation,
      hasContext: materialIds && materialIds.length > 0
    });

  } catch (error) {
    console.error('Explain concept error:', error);
    res.status(500).json({ 
      message: 'Failed to explain concept', 
      error: error.message
    });
  }
});

// Generate study guide from materials
router.post('/study-guide', auth, async (req, res) => {
  try {
    const { materialIds, includeQuestions = true } = req.body;

    if (!materialIds || materialIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one material' });
    }

    const materials = await StudyMaterial.find({
      _id: { $in: materialIds },
      userId: req.userId
    });

    if (materials.length === 0) {
      return res.status(404).json({ message: 'Materials not found' });
    }

    const combinedText = materials.map(m => m.extractedText).join('\n\n');
    const topics = materials.map(m => `${m.title} (${m.subject})`).join(', ');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'user',
        content: `Create a comprehensive study guide based on the following materials: ${topics}

Study Materials:
${combinedText.substring(0, 20000)}

Please create a structured study guide that includes:

1. **Overview** - Brief summary of the main topics
2. **Key Concepts** - Important concepts and definitions
3. **Detailed Breakdown** - Organized by main topics/sections
4. **Important Formulas/Facts** - List of crucial information to memorize
5. **Summary** - Quick review points
${includeQuestions ? '6. **Practice Questions** - 5 review questions with answers' : ''}

Use the material as a foundation and expand with helpful additional context. Format the guide in Markdown with clear headings and bullet points for easy reading.`
      }],
      temperature: 0.7,
      max_tokens: 3000
    });

    const studyGuide = completion.choices[0].message.content;

    res.json({
      studyGuide: studyGuide,
      topics: topics,
      materialCount: materials.length,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Study guide error:', error);
    res.status(500).json({ 
      message: 'Failed to generate study guide', 
      error: error.message 
    });
  }
});

// Chat with AI about study materials
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, materialIds, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Please provide a message' });
    }

    let context = '';
    
    if (materialIds && materialIds.length > 0) {
      const materials = await StudyMaterial.find({
        _id: { $in: materialIds },
        userId: req.userId
      });
      
      if (materials.length > 0) {
        context = `You have access to the following study materials:\n\n`;
        context += materials.map(m => 
          `Title: ${m.title}\nSubject: ${m.subject}\nContent: ${m.extractedText.substring(0, 5000)}`
        ).join('\n\n---\n\n');
      }
    }

    const messages = [
      {
        role: 'system',
        content: `You are a helpful AI study assistant. You help students understand concepts, answer questions, and provide study guidance. ${context ? 'Use the provided study materials to give accurate, contextual answers, but feel free to expand with additional helpful knowledge.' : 'Provide clear, educational responses.'}`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: context ? `${context}\n\nStudent question: ${message}` : message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;

    res.json({
      response: response,
      hasContext: materialIds && materialIds.length > 0
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      message: 'Failed to process chat message', 
      error: error.message 
    });
  }
});

module.exports = router;