/**
 * Admin Controller
 * Admin-specific endpoints for managing resumes, jobs, and applications
 */

const fs = require('fs');
const path = require('path');
const { Resume, User, ResumeSkill, Job, JobSkill, AIMatchResult, Application } = require('../models');
const { matchResumeToJob } = require('../services/matchingService');
const emailService = require('../services/emailService');

/**
 * Get all resumes with user information (Admin only)
 * GET /api/admin/resumes
 */
exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.findAll({
      include: [{
        model: User,
        attributes: ['user_id', 'full_name', 'email', 'phone_number']
      }],
      order: [['uploaded_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    console.error('Admin - Get all resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resumes',
      error: error.message
    });
  }
};

/**
 * Get single resume with AI-extracted skills (Admin only)
 * GET /api/admin/resumes/:resume_id
 */
exports.getResumeDetails = async (req, res) => {
  try {
    const { resume_id } = req.params;

    // Get MySQL data
    const resume = await Resume.findByPk(resume_id, {
      include: [{
        model: User,
        attributes: ['user_id', 'full_name', 'email', 'phone_number']
      }]
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Get MongoDB AI-extracted skills
    const resumeSkills = await ResumeSkill.findOne({ resume_id });

    res.status(200).json({
      success: true,
      data: {
        mysql_data: resume,
        ai_skills: resumeSkills,
        file_access: {
          path: resume.file_path,
          name: resume.file_name,
          size_kb: resume.file_size_kb
        }
      }
    });
  } catch (error) {
    console.error('Admin - Get resume details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume details',
      error: error.message
    });
  }
};

/**
 * Download resume file (Admin only)
 * GET /api/admin/resumes/:resume_id/download
 */
exports.downloadResume = async (req, res) => {
  try {
    const { resume_id } = req.params;

    const resume = await Resume.findByPk(resume_id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const filePath = path.resolve(resume.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server',
        path: resume.file_path
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.file_name}"`);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Admin - Download resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download resume',
      error: error.message
    });
  }
};

/**
 * Get resumes by user ID (Admin only)
 * GET /api/admin/users/:user_id/resumes
 */
exports.getResumesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const resumes = await Resume.findAll({
      where: { user_id },
      include: [{
        model: User,
        attributes: ['user_id', 'full_name', 'email']
      }],
      order: [['uploaded_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    console.error('Admin - Get resumes by user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user resumes',
      error: error.message
    });
  }
};

/**
 * Delete resume (Admin only)
 * DELETE /api/admin/resumes/:resume_id
 */
exports.deleteResume = async (req, res) => {
  try {
    const { resume_id } = req.params;

    const resume = await Resume.findByPk(resume_id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const filePath = path.resolve(resume.file_path);

    // Delete file from file system
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }

    // Delete from MySQL
    await resume.destroy();

    // Delete from MongoDB
    await ResumeSkill.deleteOne({ resume_id });

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully from MySQL, MongoDB, and file system'
    });
  } catch (error) {
    console.error('Admin - Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message
    });
  }
};

/**
 * Create new job with JD and hidden requirements (Admin only)
 * POST /api/admin/jobs
 */
exports.createJob = async (req, res) => {
  try {
    const {
      job_title,
      job_description,
      hidden_requirements,
      employment_type,
      work_mode,
      experience_min,
      experience_max,
      job_location,
      department,
      openings,
      application_deadline,
      job_status
    } = req.body;

    // Validation
    if (!job_title || !job_description) {
      return res.status(400).json({
        success: false,
        message: 'job_title and job_description are required'
      });
    }

    // Get admin_id from authenticated user
    console.log('Admin Controller - createJob - User:', req.user);
    const admin_id = req.user.id || req.user.user_id; // Try both just in case

    if (!admin_id) {
      return res.status(500).json({ success: false, message: 'Authentication failure: No user ID found' });
    }


    // Create job
    const job = await Job.create({
      admin_id,
      job_title,
      job_description,
      hidden_requirements: hidden_requirements || null,
      employment_type: employment_type || 'FULL_TIME',
      work_mode: work_mode || 'ONSITE',
      experience_min: experience_min || null,
      experience_max: experience_max || null,
      job_location: job_location || null,
      department: department || null,
      openings: openings || 1,
      application_deadline: application_deadline || null,
      job_status: job_status || 'OPEN'
    });

    console.log(`✅ Job created: ID=${job.job_id}, Title="${job_title}"`);

    // If skills provided (from AI analysis), save to MongoDB JobSkill
    let jobSkillsDoc = null;

    console.log(`💾 Extracting & Saving skills for Job ${job.job_id}...`);

    const { extractSkillsFromJD } = require('../services/aiExtractionService');
    // Extract skills from JD using AI
    const aiExtraction = await extractSkillsFromJD(job_title, job_description);

    // Merge User Input with AI Extraction
    // Normal Skills: AI Technical Skills + User extracted skills (if passed)
    const combinedNormalSkills = [
      ...(aiExtraction.technical_skills || []).map(s => ({
        skill_name: s.skill_name,
        weight: s.weight || 5,
        required_level: s.level || 'Intermediate'
      })),
      ...(req.body.normal_skills || []).map(s => typeof s === 'string' ? { skill_name: s, weight: 5 } : s)
    ];

    // Hidden Skills: AI Soft Skills + User Hidden Skills
    const combinedHiddenSkills = [
      ...(aiExtraction.soft_skills || []).map(s => ({
        skill_name: s.skill_name,
        importance: s.importance || 5
      })),
      ...(req.body.hidden_skills || []).map(s => typeof s === 'string' ? { skill_name: s, importance: 10 } : s)
    ];

    // Remove duplicates
    const uniqueNormal = [...new Map(combinedNormalSkills.map(s => [String(s.skill_name).toLowerCase(), s])).values()];
    const uniqueHidden = [...new Map(combinedHiddenSkills.map(s => [String(s.skill_name).toLowerCase(), s])).values()];

    if (uniqueNormal.length > 0 || uniqueHidden.length > 0) {
      jobSkillsDoc = await JobSkill.findOneAndUpdate(
        { job_id: job.job_id },
        {
          job_id: job.job_id,
          normal_skills: uniqueNormal,
          hidden_skills: uniqueHidden,
          ai_generated: true,
          generation_confidence: 85,
          metadata: {
            extraction_source: 'AI_AND_MANUAL',
            created_at: new Date()
          }
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Skills saved: ${uniqueNormal.length} Technical, ${uniqueHidden.length} Hidden/Soft`);
    }

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job_id: job.job_id,
        job_title: job.job_title,
        job_description: job.job_description,
        hidden_requirements: job.hidden_requirements,
        skills_saved: !!jobSkillsDoc
      },
      next_step: 'Job and skills saved.'
    });
  } catch (error) {
    console.error('Admin - Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
};

/**
 * Get all jobs (Admin only)
 * GET /api/admin/jobs
 */
exports.getAllJobs = async (req, res) => {
  try {
    let jobs = await Job.findAll({
      include: [{
        model: User,
        attributes: ['user_id', 'full_name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });

    // Lazy Expiration Check
    const now = new Date();
    const updatedJobs = [];

    for (const job of jobs) {
      let status = job.job_status;

      // If 'OPEN' and deadline passed, close it
      if (status === 'OPEN' && job.application_deadline && new Date(job.application_deadline) < now) {
        await job.update({ job_status: 'CLOSED' });
        status = 'CLOSED';
      }

      // Count Applications
      const appCount = await Application.count({ where: { job_id: job.job_id } });

      // Add processed job to list (using plain object to safely modify/add fields if needed)
      const jobData = job.toJSON();
      jobData.status = status === 'OPEN' ? 'Active' : 'Inactive'; // Map for Frontend
      jobData.application_count = appCount;
      jobData.views_count = 0;
      updatedJobs.push(jobData);
    }

    res.status(200).json({
      success: true,
      count: updatedJobs.length,
      data: updatedJobs
    });
  } catch (error) {
    console.error('Admin - Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs',
      error: error.message
    });
  }
};

/**
 * Get single job (Admin only)
 * GET /api/admin/jobs/:job_id
 */
exports.getJobDetails = async (req, res) => {
  try {
    const { job_id } = req.params;

    const job = await Job.findByPk(job_id, {
      include: [{
        model: User,
        attributes: ['user_id', 'full_name', 'email']
      }]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Admin - Get job details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job details',
      error: error.message
    });
  }
};

/**
 * Shortlist applicant and send email
 * POST /api/admin/applications/:id/shortlist
 */
exports.shortlistApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByPk(id, {
      include: [
        { model: User, attributes: ['full_name', 'email'] },
        { model: Job, attributes: ['job_title'] }
      ]
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Update Status
    application.application_status = 'SHORTLISTED';
    await application.save();

    // Send Email
    let emailResult = { success: false };
    if (application.User && application.User.email) {
      emailResult = await emailService.sendShortlistEmail(
        application.User.email,
        application.User.full_name,
        application.Job.job_title
      );
    }

    const msg = emailResult.success 
      ? 'Applicant shortlisted and email sent' 
      : 'Applicant shortlisted (Email failed - Check logs)';

    res.json({ success: true, message: msg, status: 'SHORTLISTED' });
  } catch (error) {
    console.error('Shortlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to shortlist', error: error.message });
  }
};

/**
 * @route   POST /api/admin/applications/:id/reject
 * @desc    Reject applicant and send email
 * @access  Admin only
 */
exports.rejectApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByPk(id, {
      include: [
        { model: User, attributes: ['full_name', 'email'] },
        { model: Job, attributes: ['job_title'] }
      ]
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Update Status
    application.application_status = 'REJECTED';
    await application.save();

    // Send Email
    let emailResult = { success: false };
    if (application.User && application.User.email) {
      emailResult = await emailService.sendRejectionEmail(
        application.User.email,
        application.User.full_name,
        application.Job.job_title
      );
    }

    const msg = emailResult.success 
      ? 'Applicant rejected and email sent' 
      : 'Applicant rejected (Email failed - Check logs)';

    res.json({ success: true, message: msg, status: 'REJECTED' });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject', error: error.message });
  }
};


/**
 * Update job (Admin only)
 * PUT /api/admin/jobs/:job_id
 */
exports.updateJob = async (req, res) => {
  try {
    const { job_id } = req.params;
    const updateData = req.body;

    const job = await Job.findByPk(job_id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Update job
    await job.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('Admin - Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
};

/**
 * Delete job (Admin only)
 * DELETE /api/admin/jobs/:job_id
 */
exports.deleteJob = async (req, res) => {
  try {
    const { job_id } = req.params;

    const job = await Job.findByPk(job_id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const jobId = Number(job_id);

    // 1. Delete Job Skills from MongoDB
    await JobSkill.deleteOne({ job_id: jobId });

    // 2. Delete Match Results from MongoDB (using job_id directly)
    await AIMatchResult.deleteMany({ job_id: jobId });

    // 3. Delete Applications (MySQL) - Unconditional delete to satisfy FK
    await Application.destroy({ where: { job_id: jobId } });

    // 4. Delete Job (MySQL)
    await job.destroy();

    res.status(200).json({
      success: true,
      message: 'Job and all related data deleted successfully'
    });
  } catch (error) {
    console.error('Admin - Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
};

/**
 * Run AI matching for a specific resume and job (Admin only)
 * POST /api/admin/match/resume/:resume_id/job/:job_id
 */
exports.runAIMatching = async (req, res) => {
  try {
    const { resume_id, job_id } = req.params;

    console.log(`🎯 Starting AI matching: Resume ${resume_id} → Job ${job_id}`);

    // 1. Get resume from MySQL
    const resume = await Resume.findByPk(resume_id, {
      include: [{ model: User, attributes: ['user_id', 'full_name', 'email'] }]
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // 2. Get job from MySQL
    const job = await Job.findByPk(job_id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // 3. Get resume skills from MongoDB
    const resumeSkills = await ResumeSkill.findOne({ resume_id: Number(resume_id) });

    if (!resumeSkills || !resumeSkills.skills || resumeSkills.skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resume skills not extracted yet. Please extract skills first.'
      });
    }

    // 4. Get job skills from MongoDB
    const jobSkills = await JobSkill.findOne({ job_id: Number(job_id) });

    if (!jobSkills || !jobSkills.normal_skills || jobSkills.normal_skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job skills not analyzed yet. Please analyze job first.'
      });
    }

    // 5. Prepare data for AI matching
    const resumeData = {
      resume_id: resume.resume_id,
      name: resume.User?.full_name || 'Unknown',
      email: resume.User?.email,
      file_name: resume.file_name,
      experience_years: resumeSkills.skills.reduce((max, s) => Math.max(max, s.years_of_experience || 0), 0),
      skills: resumeSkills.skills.map(s => ({
        skill_name: s.skill_name,
        proficiency_level: s.proficiency_level,
        years_of_experience: s.years_of_experience,
        category: s.category
      }))
    };

    const jobData = {
      job_id: job.job_id,
      job_title: job.job_title,
      experience_min: job.experience_min,
      experience_max: job.experience_max,
      employment_type: job.employment_type,
      work_mode: job.work_mode,
      job_location: job.job_location
    };

    // 6. Run AI matching with Gemini
    console.log('🤖 Calling Gemini AI for matching analysis...');
    const matchResult = await matchResumeToJob(
      resumeData,
      jobSkills.normal_skills,
      jobSkills.hidden_skills || [],
      jobData
    );

    console.log(`✅ AI matching complete: Score ${matchResult.overall_score}%, Grade: ${matchResult.match_grade}`);

    // 7. Create or find application record
    let application = await Application.findOne({
      where: {
        user_id: resume.user_id,
        job_id: job.job_id,
        resume_id: resume.resume_id
      }
    });

    if (!application) {
      application = await Application.create({
        user_id: resume.user_id,
        job_id: job.job_id,
        resume_id: resume.resume_id,
        application_status: 'APPLIED'
      });
      console.log(`📝 Created new application: ${application.application_id}`);
    }

    // 8. Save AI match result to MongoDB
    const aiMatchDoc = await AIMatchResult.findOneAndUpdate(
      { application_id: application.application_id },
      {
        application_id: application.application_id,
        resume_id: resume.resume_id,
        job_id: job.job_id,
        user_id: resume.user_id,
        overall_score: matchResult.overall_score,
        match_grade: matchResult.match_grade,
        scoring_breakdown: matchResult.scoring_breakdown,
        matched_skills: matchResult.matched_skills,
        missing_skills: matchResult.missing_skills,
        extra_skills: matchResult.extra_skills,
        ai_insights: matchResult.ai_insights,
        hidden_match_analysis: matchResult.hidden_match_analysis,
        confidence_score: matchResult.confidence_score,
        ai_model_version: matchResult.ai_model_version,
        processing_time_ms: matchResult.processing_time_ms,
        analyzed_at: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`💾 Saved AI match result to MongoDB: ${aiMatchDoc._id}`);

    res.status(200).json({
      success: true,
      message: 'AI matching completed successfully',
      data: {
        application_id: application.application_id,
        overall_score: matchResult.overall_score,
        match_grade: matchResult.match_grade,
        scoring_breakdown: matchResult.scoring_breakdown,
        matched_skills: matchResult.matched_skills,
        missing_skills: matchResult.missing_skills,
        extra_skills: matchResult.extra_skills,
        ai_insights: matchResult.ai_insights,
        hidden_match_analysis: matchResult.hidden_match_analysis,
        confidence_score: matchResult.confidence_score,
        ai_model_version: matchResult.ai_model_version,
        processing_time_ms: matchResult.processing_time_ms,
        candidate: {
          name: resume.User?.full_name,
          email: resume.User?.email,
          resume_file: resume.file_name
        },
        job: {
          title: job.job_title,
          location: job.job_location,
          work_mode: job.work_mode
        }
      }
    });
  } catch (error) {
    console.error('❌ Admin - AI matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run AI matching',
      error: error.message
    });
  }
};

/**
 * Get all match results for a job (Admin only)
 * GET /api/admin/jobs/:job_id/matches
 */
exports.getJobMatches = async (req, res) => {
  try {
    const { job_id } = req.params;
    const { min_score = 0, sort = '-overall_score', limit = 50 } = req.query;

    console.log(`📊 Fetching matches for Job ${job_id}`);

    // 1. Fetch ALL Applications for this job (MySQL)
    // Remove 'phone_number' to prevent Sequelize Error
    const applications = await Application.findAll({
      where: { job_id: Number(job_id) },
      include: [
        { model: User, attributes: ['user_id', 'full_name', 'email'] },
        { model: Resume, attributes: ['resume_id', 'file_name'] }
      ]
    });

    if (!applications || applications.length === 0) {
      return res.status(200).json({
        success: true,
        job_id: Number(job_id),
        count: 0,
        data: []
      });
    }

    // 2. Fetch AI Match Results for these applications (MongoDB)
    const enrichedMatches = await Promise.all(applications.map(async (app) => {
      let match = await AIMatchResult.findOne({ application_id: app.application_id });

      const defaultMatch = {
        overall_score: 0,
        match_grade: 'Pending',
        scoring_breakdown: {},
        matched_skills: [],
        missing_skills: [],
        ai_insights: {},
        confidence_score: 0
      };

      const finalMatch = (match && match.overall_score !== undefined) ? match.toObject() : defaultMatch;

      return {
        application_id: app.application_id,
        resume_id: app.resume_id,
        overall_score: finalMatch.overall_score || 0,
        match_grade: finalMatch.match_grade || 'Pending',
        scoring_breakdown: finalMatch.scoring_breakdown || {},
        matched_skills_count: Array.isArray(finalMatch.matched_skills) ? finalMatch.matched_skills.length : 0,
        missing_skills_count: Array.isArray(finalMatch.missing_skills) ? finalMatch.missing_skills.length : 0,
        ai_insights: finalMatch.ai_insights || {},
        confidence_score: finalMatch.confidence_score || 0,
        candidate: {
          user_id: app.User?.user_id,
          name: app.User?.full_name || 'Unknown',
          email: app.User?.email,
          resume_file: app.Resume?.file_name
        },
        application_status: app.application_status,
        applied_at: app.applied_at
      };
    }));

    // Sort: Applications with AI scores first, then others
    enrichedMatches.sort((a, b) => b.overall_score - a.overall_score);

    res.status(200).json({
      success: true,
      job_id: Number(job_id),
      count: enrichedMatches.length,
      data: enrichedMatches
    });
  } catch (error) {
    console.error('❌ Admin - Get job matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job matches',
      error: error.message
    });
  }
};

/**
 * Get detailed match result for a specific application (Admin only)
 * GET /api/admin/match/:application_id
 */
exports.getMatchDetails = async (req, res) => {
  try {
    const { application_id } = req.params;

    console.log(`🔍 Fetching match details for Application ${application_id}`);

    // Get AI match from MongoDB (include hidden analysis for admin)
    const match = await AIMatchResult.findOne({ application_id: Number(application_id) });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match result not found. Run AI matching first.'
      });
    }

    // Get application from MySQL
    const application = await Application.findByPk(application_id, {
      include: [
        {
          model: User,
          attributes: ['user_id', 'full_name', 'email', 'created_at']
        },
        {
          model: Resume,
          attributes: ['resume_id', 'file_name', 'uploaded_at']
        },
        {
          model: Job,
          attributes: ['job_id', 'job_title', 'job_location', 'work_mode', 'employment_type', 'experience_min', 'experience_max']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Get resume skills from MongoDB
    const resumeSkills = await ResumeSkill.findOne({ resume_id: match.resume_id });

    // Get job skills from MongoDB
    const jobSkills = await JobSkill.findOne({ job_id: match.job_id });

    res.status(200).json({
      success: true,
      data: {
        // Application info
        application: {
          application_id: application.application_id,
          status: application.application_status,
          applied_at: application.applied_at
        },

        // Candidate info
        candidate: {
          user_id: application.User?.user_id,
          name: application.User?.full_name,
          email: application.User?.email,
          phone: application.User?.phone_number,
          resume_file: application.Resume?.file_name,
          resume_id: application.Resume?.resume_id,
          all_skills: resumeSkills?.skills || []
        },

        // Job info
        job: {
          job_id: application.Job?.job_id,
          title: application.Job?.job_title,
          location: application.Job?.job_location,
          work_mode: application.Job?.work_mode,
          employment_type: application.Job?.employment_type,
          experience_required: `${application.Job?.experience_min || 0}-${application.Job?.experience_max || 10} years`,
          required_skills: jobSkills?.normal_skills || [],
          hidden_requirements: jobSkills?.hidden_skills || []
        },

        // Match analysis
        match: {
          overall_score: match.overall_score,
          match_grade: match.match_grade,
          scoring_breakdown: match.scoring_breakdown,
          matched_skills: match.matched_skills,
          missing_skills: match.missing_skills,
          extra_skills: match.extra_skills,
          ai_insights: match.ai_insights,
          hidden_match_analysis: match.hidden_match_analysis, // Admin can see hidden analysis
          confidence_score: match.confidence_score,
          ai_model_version: match.ai_model_version,
          processing_time_ms: match.processing_time_ms,
          analyzed_at: match.analyzed_at
        }
      }
    });
  } catch (error) {
    console.error('❌ Admin - Get match details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve match details',
      error: error.message
    });
  }
};
