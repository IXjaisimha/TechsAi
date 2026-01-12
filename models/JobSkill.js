const mongoose = require('mongoose');

/**
 * JobSkill Schema - MongoDB
 * Stores both normal (public) and hidden (internal) skill requirements
 * Moved from MySQL to MongoDB due to:
 * - Nested skill requirements structure
 * - Frequent updates to skill matching logic
 * - AI-driven skill analysis needs
 * - Separation of public vs internal criteria
 */
const jobSkillSchema = new mongoose.Schema({
  job_id: {
    type: Number,
    required: true,
    index: true,
    unique: true,
    ref: 'Job' // Reference to MySQL job.id
  },
  
  // Normal (Public) Skills - visible to candidates
  normal_skills: [{
    skill_name: {
      type: String,
      required: true,
      trim: true
    },
    importance: {
      type: String,
      enum: ['Required', 'Preferred', 'Nice-to-have'],
      default: 'Required'
    },
    min_years: {
      type: Number,
      min: 0,
      default: 0
    },
    category: {
      type: String,
      enum: ['Technical', 'Soft', 'Language', 'Tool', 'Framework', 'Other'],
      default: 'Technical'
    },
    weight: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    }
  }],
  
  // Hidden Skills - internal matching criteria (company-only)
  hidden_skills: [{
    skill_name: {
      type: String,
      required: true,
      trim: true
    },
    reason: {
      type: String, // Why this is hidden (e.g., "Cultural fit", "Internal requirement")
    },
    importance: {
      type: String,
      enum: ['Critical', 'Important', 'Considered'],
      default: 'Important'
    },
    category: {
      type: String,
      enum: ['Cultural', 'Internal', 'Strategic', 'Other'],
      default: 'Internal'
    },
    weight: {
      type: Number,
      min: 0,
      max: 10,
      default: 7
    }
  }],
  
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  
  // AI-related metadata
  ai_generated: {
    type: Boolean,
    default: false
  },
  generation_confidence: {
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
  collection: 'job_skills'
});

// Indexes for efficient querying
jobSkillSchema.index({ 'normal_skills.skill_name': 1 });
jobSkillSchema.index({ 'hidden_skills.skill_name': 1 });

// Update timestamp on save
jobSkillSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('JobSkill', jobSkillSchema);
