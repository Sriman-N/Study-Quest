const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dailyChallengesRouter = require('./routes/dailyChallenges');
const studyMaterialsRouter = require('./routes/studyMaterials');
const aiStudyAssistantRoutes = require('./routes/aiStudyAssistant');
const shopRoutes = require('./routes/shop'); 

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/study-quest')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Study Quest API! 🎮📚' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/characters', require('./routes/characters'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/daily-challenges', dailyChallengesRouter);
app.use('/api/study-materials', studyMaterialsRouter);
app.use('/api/ai-assistant', aiStudyAssistantRoutes);
app.use('/api/shop', shopRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`); 
});