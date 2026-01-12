/**
 * AI Match Controller
 * Demonstrates MongoDB operations for AI-generated match results
 * Combines data from both MySQL (users, jobs, applications) and MongoDB (skills, matches)
 */

const { AIMatchResult, ResumeSkill, JobSkill } = require('../models');

/**
 * Create AI match result (MongoDB)
 * POST /api/ai-matches
 */
exports.createMatchResult = async (req, res) => {
  try {
    const {
      application_id,
      resume_id,
      job_id,
      user_id,
      overall_score,
      match_grade,
      scoring_breakdown,
      matched_skills,
      missing_skills,
      extra_skills,
      ai_insights,
      hidden_match_analysis,
      confidence_score,
      ai_model_version,
      processing_time_ms
    } = req.body;

    const matchResult = new AIMatchResult({
      application_id,
      resume_id,
      job_id,
      user_id,
      overall_score,
      match_grade,
      scoring_breakdown,
      matched_skills,
      missing_skills,
      extra_skills,
      ai_insights,
      hidden_match_analysis,
      confidence_score,
      ai_model_version,
      processing_time_ms,
      analyzed_at: new Date()
    });

    await matchResult.save();

    res.status(201).json({
      success: true,
      message: 'AI match result saved successfully',
      data: matchResult
    });
  } catch (error) {
    console.error('Error creating match result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create match result',
      error: error.message
    });
  }
};

/**
 * Get match result by application ID (MongoDB)
 * GET /api/ai-matches/application/:applicationId
 */
exports.getMatchByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const matchResult = await AIMatchResult.findOne({ 
      application_id: parseInt(applicationId) 
    }).select('-hidden_match_analysis'); // Exclude hidden analysis for public view

    if (!matchResult) {
      return res.status(404).json({
        success: false,
        message: 'Match result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: matchResult
    });
  } catch (error) {
    console.error('Error fetching match result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match result',
      error: error.message
    });
  }
};

/**
 * Get all matches for a user (MongoDB)
 * GET /api/ai-matches/user/:userId
 */
exports.getUserMatches = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, sort = '-overall_score' } = req.query;

    const matches = await AIMatchResult.find({ 
      user_id: parseInt(userId) 
    })
    .select('-hidden_match_analysis')
    .sort(sort)
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('Error fetching user matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user matches',
      error: error.message
    });
  }
};

/**
 * Get top matches for a job (MongoDB)
 * GET /api/ai-matches/job/:jobId/top
 */
exports.getTopMatchesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { limit = 10, min_score = 60 } = req.query;

    const matches = await AIMatchResult.find({ 
      job_id: parseInt(jobId),
      overall_score: { $gte: parseInt(min_score) }
    })
    .sort('-overall_score')
    .limit(parseInt(limit))
    .select('application_id user_id resume_id overall_score match_grade matched_skills ai_insights');

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('Error fetching top matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top matches',
      error: error.message
    });
  }
};

/**
 * POLYGLOT EXAMPLE: Complete match analysis
 * Combines data from MySQL (application details) and MongoDB (skills + AI match)
 * GET /api/ai-matches/:applicationId/complete
 */
exports.getCompleteMatchAnalysis = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // 1. Get AI match result from MongoDB
    const matchResult = await AIMatchResult.findOne({ 
      application_id: parseInt(applicationId) 
    });

    if (!matchResult) {
      return res.status(404).json({
        success: false,
        message: 'Match result not found'
      });
    }

    // 2. Get resume skills from MongoDB
    const resumeSkills = await ResumeSkill.findOne({ 
      resume_id: matchResult.resume_id 
    });

    // 3. Get job skills from MongoDB
    const jobSkills = await JobSkill.findOne({ 
      job_id: matchResult.job_id 
    });

    // 4. TODO: Get application details from MySQL (Sequelize)
    // const { Application, User, Job } = require('../models');
    // const application = await Application.findByPk(applicationId, {
    //   include: [User, Job]
    // });

    // Combine all data
    const completeAnalysis = {
      match_result: matchResult,
      resume_skills: resumeSkills,
      job_requirements: {
        normal_skills: jobSkills?.normal_skills,
        // Hidden skills excluded for public view
      },
      // application_details: application // From MySQL
    };

    res.status(200).json({
      success: true,
      message: 'Complete analysis retrieved from both databases',
      data: completeAnalysis
    });
  } catch (error) {
    console.error('Error fetching complete analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complete analysis',
      error: error.message
    });
  }
};

/**
 * Get match statistics for a job (MongoDB aggregation)
 * GET /api/ai-matches/job/:jobId/stats
 */
exports.getJobMatchStats = async (req, res) => {
  try {
    const { jobId } = req.params;

    const stats = await AIMatchResult.aggregate([
      { $match: { job_id: parseInt(jobId) } },
      {
        $group: {
          _id: '$match_grade',
          count: { $sum: 1 },
          avg_score: { $avg: '$overall_score' },
          max_score: { $max: '$overall_score' },
          min_score: { $min: '$overall_score' }
        }
      },
      { $sort: { avg_score: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        job_id: parseInt(jobId),
        statistics: stats,
        total_applications: stats.reduce((sum, s) => sum + s.count, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching match stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match statistics',
      error: error.message
    });
  }
};

/**
 * Delete match result (MongoDB)
 * DELETE /api/ai-matches/:applicationId
 */
exports.deleteMatchResult = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const result = await AIMatchResult.findOneAndDelete({ 
      application_id: parseInt(applicationId) 
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Match result not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Match result deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting match result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete match result',
      error: error.message
    });
  }
};
