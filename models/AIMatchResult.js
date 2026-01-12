const mongoose = require('mongoose');

/**
 * AIMatchResult Schema - MongoDB
 * Stores AI-generated matching results between resumes and jobs
 * Moved from MySQL to MongoDB due to:
 * - Complex nested match analysis data
 * - Frequent schema evolution as AI improves
 * - Large volume of analytical data
 * - Flexible structure for different AI models
 */
const aiMatchResultSchema = new mongoose.Schema({
  application_id: {
    type: Number,
    required: true,
    index: true,
    ref: 'Application' // Reference to MySQL application.id
  },
  resume_id: {
    type: Number,
    required: true,
    index: true,
    ref: 'Resume'
  },
  job_id: {
    type: Number,
    required: true,
    index: true,
    ref: 'Job'
  },
  user_id: {
    type: Number,
    required: true,
    index: true,
    ref: 'User'
  },
  
  // Overall Match Score
  overall_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  match_grade: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    required: true
  },
  
  // Detailed Scoring Breakdown
  scoring_breakdown: {
    technical_skills_score: { type: Number, min: 0, max: 100 },
    soft_skills_score: { type: Number, min: 0, max: 100 },
    experience_score: { type: Number, min: 0, max: 100 },
    education_score: { type: Number, min: 0, max: 100 },
    hidden_criteria_score: { type: Number, min: 0, max: 100 }
  },
  
  // Skill Matching Details
  matched_skills: [{
    skill_name: String,
    resume_proficiency: String,
    required_proficiency: String,
    match_strength: { type: Number, min: 0, max: 100 },
    is_hidden: { type: Boolean, default: false }
  }],
  
  missing_skills: [{
    skill_name: String,
    importance: String,
    category: String,
    is_critical: Boolean
  }],
  
  extra_skills: [{
    skill_name: String,
    value_add_score: { type: Number, min: 0, max: 10 }
  }],
  
  // AI Analysis
  ai_insights: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    red_flags: [String],
    unique_selling_points: [String]
  },
  
  // Hidden Criteria Analysis (internal use only)
  hidden_match_analysis: {
    cultural_fit_score: { type: Number, min: 0, max: 100 },
    strategic_alignment_score: { type: Number, min: 0, max: 100 },
    internal_notes: [String],
    flags: [String]
  },
  
  // Confidence and Metadata
  confidence_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  ai_model_version: {
    type: String,
    required: true
  },
  
  processing_time_ms: {
    type: Number
  },
  
  // Timestamps
  analyzed_at: {
    type: Date,
    default: Date.now
  },
  
  // Additional flexible data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'ai_match_results'
});

// Compound indexes for efficient queries
aiMatchResultSchema.index({ resume_id: 1, job_id: 1 });
aiMatchResultSchema.index({ user_id: 1, analyzed_at: -1 });
aiMatchResultSchema.index({ job_id: 1, overall_score: -1 });
aiMatchResultSchema.index({ overall_score: -1, match_grade: 1 });

module.exports = mongoose.model('AIMatchResult', aiMatchResultSchema);
