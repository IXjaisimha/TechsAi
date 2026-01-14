const mongoose = require('mongoose');

/**
 * ResumeSkill Schema - MongoDB
 * Stores flexible skill sets extracted from resumes
 * Moved from MySQL to MongoDB due to:
 * - Variable and evolving skill structures
 * - Better handling of nested/array data
 * - Easier AI integration and updates
 */
const resumeSkillSchema = new mongoose.Schema({
  resume_id: {
    type: Number,
    required: true,
    index: true,
    ref: 'Resume' // Reference to MySQL resume.id
  },
  skills: [{
    skill_name: {
      type: String,
      required: true,
      trim: true
    },
    proficiency_level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    years_of_experience: {
      type: Number,
      min: 0
    },
    category: {
      type: String,
      enum: ['Technical', 'Soft', 'Language', 'Tool', 'Framework', 'Management', 'Other'],
      default: 'Technical'
    },
    certifications: [String],
    projects_used: [String]
  }],
  extracted_at: {
    type: Date,
    default: Date.now
  },
  extraction_method: {
    type: String,
    default: 'AI'
    // No enum - allows dynamic AI model names like 'AI (gemini-1.5-pro)'
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 100
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'resume_skills'
});

// Indexes for efficient querying
resumeSkillSchema.index({ 'skills.skill_name': 1 });
resumeSkillSchema.index({ 'skills.category': 1 });
resumeSkillSchema.index({ resume_id: 1, 'skills.skill_name': 1 });

module.exports = mongoose.model('ResumeSkill', resumeSkillSchema);
