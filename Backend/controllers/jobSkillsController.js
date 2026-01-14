/**
 * Job Skills Controller
 * Demonstrates MongoDB operations for job requirements
 * Handles both normal (public) and hidden (internal) skills
 */

const { JobSkill, Job } = require('../models');

/**
 * Get all jobs (with skills)
 * GET /api/job-skills
 */
exports.getAllJobSkills = async (req, res) => {
  try {
    // 1. Fetch all OPEN jobs from MySQL
    const jobs = await Job.findAll({
      where: { job_status: 'OPEN' },
      order: [['created_at', 'DESC']]
    });

    if (!jobs || jobs.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Fetch skills from MongoDB
    const jobIds = jobs.map(j => j.job_id);
    const jobSkills = await JobSkill.find({
      job_id: { $in: jobIds }
    });

    // 3. Merge data
    const mergedData = jobs.map(j => {
      const skillsData = jobSkills.find(js => js.job_id === j.job_id);
      return {
        id: j.job_id,
        title: j.job_title,
        description: j.job_description,
        location: j.job_location,
        type: j.employment_type,
        postedAt: j.created_at,
        skills: skillsData ? skillsData.normal_skills : [],
        aiAnalysis: skillsData ? {
          isGenerated: skillsData.ai_generated,
          confidence: skillsData.generation_confidence
        } : null
      };
    });

    res.status(200).json({
      success: true,
      count: mergedData.length,
      data: mergedData
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

/**
 * Add/Update job skills (MongoDB)
 * POST /api/job-skills/:jobId
 */
exports.setJobSkills = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { normal_skills, hidden_skills, ai_generated, generation_confidence } = req.body;

    const jobSkill = await JobSkill.findOneAndUpdate(
      { job_id: parseInt(jobId) },
      {
        job_id: parseInt(jobId),
        normal_skills: normal_skills || [],
        hidden_skills: hidden_skills || [],
        ai_generated: ai_generated || false,
        generation_confidence,
        updated_at: new Date()
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    res.status(201).json({
      success: true,
      message: 'Job skills saved successfully',
      data: jobSkill
    });
  } catch (error) {
    console.error('Error setting job skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set job skills',
      error: error.message
    });
  }
};

/**
 * Get job skills - public view (MongoDB)
 * GET /api/job-skills/:jobId
 * Returns only normal skills (hides internal criteria)
 */
exports.getJobSkills = async (req, res) => {
  try {
    const { jobId } = req.params;

    const jobSkill = await JobSkill.findOne({
      job_id: parseInt(jobId)
    }).select('job_id normal_skills created_at updated_at');

    if (!jobSkill) {
      return res.status(404).json({
        success: false,
        message: 'Job skills not found'
      });
    }

    res.status(200).json({
      success: true,
      data: jobSkill
    });
  } catch (error) {
    console.error('Error fetching job skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job skills',
      error: error.message
    });
  }
};

/**
 * Get complete job skills - internal view (MongoDB)
 * GET /api/job-skills/:jobId/internal
 * Returns both normal AND hidden skills (for internal use only)
 */
exports.getJobSkillsInternal = async (req, res) => {
  try {
    const { jobId } = req.params;

    // TODO: Add authentication check - only admins/recruiters should access this
    const jobSkill = await JobSkill.findOne({
      job_id: parseInt(jobId)
    });

    if (!jobSkill) {
      return res.status(404).json({
        success: false,
        message: 'Job skills not found'
      });
    }

    res.status(200).json({
      success: true,
      data: jobSkill,
      warning: 'Contains hidden criteria - internal use only'
    });
  } catch (error) {
    console.error('Error fetching internal job skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internal job skills',
      error: error.message
    });
  }
};

/**
 * Search jobs by skill requirements (MongoDB)
 * GET /api/job-skills/search?skill=React&importance=Required
 */
exports.searchJobsBySkill = async (req, res) => {
  try {
    const { skill, importance, category } = req.query;

    let query = {};

    if (skill) {
      query['normal_skills.skill_name'] = new RegExp(skill, 'i');
    }

    if (importance) {
      query['normal_skills.importance'] = importance;
    }

    if (category) {
      query['normal_skills.category'] = category;
    }

    const jobs = await JobSkill.find(query)
      .select('job_id normal_skills')
      .limit(50);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search jobs',
      error: error.message
    });
  }
};

/**
 * Add hidden skill to job (MongoDB)
 * POST /api/job-skills/:jobId/hidden
 */
exports.addHiddenSkill = async (req, res) => {
  try {
    const { jobId } = req.params;
    const hiddenSkill = req.body;

    // TODO: Add authentication - only admins should access this

    const result = await JobSkill.findOneAndUpdate(
      { job_id: parseInt(jobId) },
      {
        $push: { hidden_skills: hiddenSkill }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Hidden skill added successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding hidden skill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add hidden skill',
      error: error.message
    });
  }
};

/**
 * Delete job skills (MongoDB)
 * DELETE /api/job-skills/:jobId
 */
exports.deleteJobSkills = async (req, res) => {
  try {
    const { jobId } = req.params;

    const result = await JobSkill.findOneAndDelete({
      job_id: parseInt(jobId)
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Job skills not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job skills deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job skills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job skills',
      error: error.message
    });
  }
};
