const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DailyChallenge = require('../models/DailyChallenge');
const StudyMaterial = require('../models/StudyMaterial');
const Character = require('../models/Character');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get active daily challenges
router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const challenges = await DailyChallenge.find({
      userId: req.userId,
      expiresAt: { $gt: now }
    }).sort({ createdAt: -1 });

    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate AI quiz challenge from study materials
router.post('/generate-quiz', auth, async (req, res) => {
  try {
    const { materialIds, difficulty = 'medium' } = req.body;

    // Fetch study materials
    const materials = await StudyMaterial.find({
      _id: { $in: materialIds },
      userId: req.userId
    });

    if (materials.length === 0) {
      return res.status(404).json({ message: 'No study materials found' });
    }

    // Combine extracted text from materials
    const combinedText = materials.map(m => m.extractedText).join('\n\n');
    const subject = materials[0].subject;

    console.log('=== QUIZ GENERATION DEBUG ===');
    console.log('Subject:', subject);
    console.log('Number of materials:', materials.length);
    console.log('Combined text length:', combinedText.length);
    console.log('First 500 chars:', combinedText.substring(0, 500));
    console.log('===========================');

    // Generate quiz using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{
        role: "user",
        content: `You are creating a ${difficulty} difficulty quiz based on the study material provided below.

Subject: ${subject}

Study Material:
${combinedText.substring(0, 15000)}

INSTRUCTIONS:
- Create EXACTLY 5 multiple-choice questions based on the topics and concepts covered in the material above
- Questions should test understanding of the SPECIFIC topics mentioned in the material
- Each question must have exactly 4 options
- Use your knowledge to create clear, well-written questions and comprehensive explanations
- Explanations should help the student understand WHY the answer is correct, using additional context beyond just what's in the material
- Make sure questions are appropriate for ${difficulty} difficulty level

Respond with ONLY valid JSON in this format (no markdown, no code blocks, no extra text):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Comprehensive explanation of why this answer is correct, with additional context to help learning"
    }
  ]
}

The correctAnswer should be the index (0-3) of the correct option.`
      }],
      temperature: 0.7,
      max_tokens: 2500
    });

    const responseText = completion.choices[0].message.content;
    
    console.log('=== AI RESPONSE ===');
    console.log('Raw response:', responseText.substring(0, 500));
    console.log('==================');
    
    // Remove markdown code blocks if present
    const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const quizData = JSON.parse(cleanedResponse);

    // Validate that we got questions
    if (!quizData.questions || quizData.questions.length === 0) {
      throw new Error('No questions generated');
    }

    console.log('Generated questions:', quizData.questions.length);
    console.log('First question:', quizData.questions[0].question);

    // Calculate rewards based on difficulty
    const rewards = {
      easy: { xp: 30, gold: 5 },
      medium: { xp: 50, gold: 10 },
      hard: { xp: 80, gold: 20 }
    };

    const { xp, gold } = rewards[difficulty];

    // Create daily challenge
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999); // Expires at end of day

    const challenge = new DailyChallenge({
      userId: req.userId,
      type: 'quiz',
      title: `${subject} Quiz Challenge`,
      description: `Test your knowledge with a ${difficulty} ${subject} quiz!`,
      difficulty,
      questions: quizData.questions,
      subject,
      xpReward: xp,
      goldReward: gold,
      expiresAt
    });

    await challenge.save();

    res.json(challenge);
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: 'Failed to generate quiz', error: error.message });
  }
});

// Submit quiz answers
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body; // Array of answer indices
    const challenge = await DailyChallenge.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.completed) {
      return res.status(400).json({ message: 'Challenge already completed' });
    }

    if (new Date() > challenge.expiresAt) {
      return res.status(400).json({ message: 'Challenge expired' });
    }

    // Calculate score
    let correctCount = 0;
    challenge.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / challenge.questions.length) * 100);
    
    challenge.completed = true;
    challenge.completedAt = new Date();
    challenge.score = score;
    await challenge.save();

    // Award rewards
    const character = await Character.findOne({ userId: req.userId });
    if (character) {
      character.addXP(challenge.xpReward);
      character.addGold(challenge.goldReward);
      await character.save();
    }

    res.json({
      challenge,
      score,
      correctCount,
      totalQuestions: challenge.questions.length,
      rewards: {
        xp: challenge.xpReward,
        gold: challenge.goldReward
      },
      character
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;