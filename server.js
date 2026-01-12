const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize, connectMongoDB } = require('./models');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const skillsRoutes = require('./routes/skills');
const jobSkillsRoutes = require('./routes/jobSkills');
const aiMatchesRoutes = require('./routes/aiMatches');
const resumesRoutes = require('./routes/resumes');
const adminRoutes = require('./routes/admin');
const jobAnalysisRoutes = require('./routes/jobAnalysis');
const matchingRoutes = require('./routes/matching');
const rankingRoutes = require('./routes/ranking');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// Database Connections
// ============================================

// MySQL Connection (Structured Data)
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL connected successfully (Structured Data)');
    return sequelize.sync({ alter: false });
  })
  .then(() => console.log('✅ MySQL Database synchronized'))
  .catch((err) => console.error('❌ MySQL connection error:', err));

// MongoDB Connection (Unstructured/AI Data)
connectMongoDB()
  .then(() => console.log('✅ MongoDB ready (AI & Skills Data)'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/job-skills', jobSkillsRoutes);
app.use('/api/ai-matches', aiMatchesRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/job-analysis', jobAnalysisRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/ranking', rankingRoutes);

// Health check route (JSON)
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Auth API is running',
    architecture: 'Polyglot Persistence',
    databases: {
     mysql: 'Structured Data (Users, Jobs, Applications, Resumes)',
     mongodb: 'Unstructured Data (Skills, AI Matches, Extracted Resume Features)'
    },
    features: {
      'Resume Upload': 'POST /api/resumes/upload',
      'AI Extraction': 'Automatic skill extraction from PDF/DOC',
      'Skill Matching': 'MongoDB-backed skill comparison'
    }
  });
});

// Frontend entry
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Using Polyglot Persistence Architecture`);
});
