const { Application, Resume, Job, ResumeSkill, JobSkill, AIMatchResult, User } = require('../models');
const { extractFromResume } = require('../services/aiExtractionService');
const { matchResumeToJob } = require('../services/matchingService');
const upload = require('../config/multerConfig');
const path = require('path');
const fs = require('fs');

// Analyze resume against job before applying
exports.analyzeApplication = async (req, res) => {
    try {
        const { jobId } = req.body;
        const file = req.files[0]; // helper

        if (!file || !jobId) {
            return res.status(400).json({ success: false, message: 'Resume file and Job ID are required' });
        }

        // 1. Extract skills from uploaded resume (temporary extraction for analysis)
        // We might not want to save to DB yet, or maybe we do? 
        // For now, let's assume we extract and match on the fly or save as a draft.
        // Given the flow, let's extract.

        // We need to read the file content. 
        // Assuming analyzeResume takes a file path or buffer.
        const extraction = await extractFromResume(file.path);

        // 2. Get Job Skills
        const jobSkills = await JobSkill.findOne({ job_id: jobId });
        if (!jobSkills) {
            return res.status(404).json({ success: false, message: 'Job not found or not analyzed yet' });
        }

        // 3. Match
        // We need to construct a "candidate profile" structure that matchingService expects
        const candidateProfile = {
            skills: extraction.skills.map(s => ({
                skill_name: s,
                proficiency_level: 'Intermediate', // Default
                years_of_experience: 1 // Default
            })),
            education: extraction.education || [],
            experience_years: extraction.experience_years || 0
        };

        const matchResult = await matchResumeToJob(
            candidateProfile,
            jobSkills.normal_skills || [],
            jobSkills.hidden_skills || []
        );

        // 4. Format response for frontend
        const analysis = {
            match_score: Math.round(matchResult.overall_score),
            missing_skills: (matchResult.missing_skills || []).map(s => s.skill_name),
            skill_suggestions: (matchResult.matched_skills || []).map(s => ({
                skill: s.skill_name,
                reason: 'Found in resume and matches job',
                importance: 'high'
            }))
        };

        // Clean up temp file if needed, or keep it if we reuse it? 
        // Multer saves it. fixing cleanup later if needed.

        res.json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ success: false, message: 'Analysis failed', error: error.message });
    }
};

// Submit application
exports.submitApplication = async (req, res) => {
    try {
        const { jobId, selectedSkills } = req.body;
        const file = req.files[0];
        const userId = req.user.id; // From auth middleware

        if (!file || !jobId) {
            return res.status(400).json({ success: false, message: 'Resume file and Job ID are required' });
        }

        // 1. Save Resume Record (and File)
        // Check if resume already exists/uploaded via this specific flow?
        // Ideally we create a new entry in resumes table
        const resume = await Resume.create({
            user_id: userId,
            file_path: file.path,
            file_name: file.originalname,
            file_size_kb: Math.round(file.size / 1024)
        });

        // 2. Extract Skills (AI)
        const extraction = await extractFromResume(file.path);

        // 3. Save extracted skills to MongoDB (ResumeSkill)
        await ResumeSkill.create({
            resume_id: resume.resume_id,
            skills: extraction.skills || [],
            extraction_method: extraction.extraction_method,
            confidence_score: extraction.confidence_score,
            metadata: {
                experience_years: extraction.experience_years,
                education: extraction.education,
                raw_text_preview: extraction.raw_text_preview
            }
        });

        // 4. Create Application (MySQL)
        const application = await Application.create({
            user_id: userId,
            job_id: jobId,
            resume_id: resume.resume_id,
            application_status: 'APPLIED'
        });

        // 5. Run Matching (AI)
        // Fetch Job Skills (MongoDB)
        const jobSkills = await JobSkill.findOne({ job_id: jobId });
        // Fetch Job Details (MySQL) for matching context
        const job = await Job.findByPk(jobId);

        if (jobSkills && job) {
            const matchResult = await matchResumeToJob(
                extraction,
                jobSkills.normal_skills || [],
                jobSkills.hidden_skills || [],
                job
            );

            // 6. Save Match Results to MongoDB (AIMatchResult)
            await AIMatchResult.create({
                application_id: application.application_id,
                resume_id: resume.resume_id,
                job_id: jobId,
                user_id: userId,
                overall_score: matchResult.overall_score,
                public_score: matchResult.public_score, // Save public score
                match_grade: matchResult.match_grade,
                scoring_breakdown: matchResult.scoring_breakdown,
                matched_skills: matchResult.matched_skills,
                missing_skills: matchResult.missing_skills,
                extra_skills: matchResult.extra_skills,
                ai_insights: matchResult.ai_insights,
                hidden_match_analysis: matchResult.hidden_match_analysis,
                confidence_score: matchResult.confidence_score,
                ai_model_version: matchResult.ai_model_version,
                processing_time_ms: matchResult.processing_time_ms
            });
        }

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: application.application_id
        });

    } catch (error) {
        console.error('Application error:', error);
        res.status(500).json({ success: false, message: 'Application failed', error: error.message });
    }
};

// Get user's applications
// GET /api/applications/my
exports.getUserApplications = async (req, res) => {
    try {
        console.log('Fetching applications for user:', req.user);
        if (!req.user || !req.user.id) {
            throw new Error('User ID not found in request');
        }
        const userId = req.user.id;

        // Fetch applications from MySQL
        const applications = await Application.findAll({
            where: { user_id: userId },
            include: [{
                model: Job,
                attributes: ['job_title', 'job_id', 'job_status', 'created_at'],
                include: [{
                    model: User, // Job owner (Company)
                    attributes: ['full_name']
                }]
            }],
            order: [['applied_at', 'DESC']]
        });

        // Enhance with AI Match Data from MongoDB
        const enhancedApplications = await Promise.all(applications.map(async (app) => {
            const matchResult = await AIMatchResult.findOne({
                application_id: app.application_id
            }).select('overall_score public_score match_grade');

            // Format for frontend (matching Applications.jsx expectations)
            return {
                application_id: app.application_id,
                job_id: app.job_id,
                title: app.Job ? app.Job.job_title : 'Unknown Job',
                company_name: app.Job && app.Job.User ? app.Job.User.full_name : 'Unknown Company',
                application_date: app.applied_at, // Use applied_at from definition
                status: app.application_status,
                // Use public_score if available, otherwise fallback (legacy support)
                total_score: matchResult ? Math.round(matchResult.public_score || matchResult.overall_score) : 0,
                match_grade: matchResult ? matchResult.match_grade : 'Pending'
            };
        }));

        res.json(enhancedApplications);
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch applications', error: error.message });
    }
};

// Get Single Application Details (with AI Match)
// GET /api/applications/:id
exports.getApplicationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        const application = await Application.findByPk(id, {
            include: [
                { model: Job, attributes: ['job_title', 'job_id'] },
                { model: Resume, attributes: ['file_name', 'file_path'] }
            ]
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Access Control
        if (role !== 'ADMIN' && application.user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Fetch AI Result from MongoDB
        const matchResult = await AIMatchResult.findOne({ application_id: id });

        if (!matchResult) {
            return res.json({ success: true, application, analysis: null });
        }

        let analysis = matchResult.toObject();

        // 🟢 Visibility Filter (User vs Admin)
        if (role !== 'ADMIN') {
            // Use Public Score for User
            analysis.match_score = analysis.public_score || analysis.overall_score;

            // Hide internal/sensitive details for candidates
            delete analysis.hidden_match_analysis;
            delete analysis.scoring_breakdown.hidden_criteria_score;
            delete analysis.overall_score; // Hide admin score

            // Filter matched skills to remove hidden ones (though typically hidden matches aren't shown, but flag handles it)
            if (analysis.matched_skills) {
                analysis.matched_skills = analysis.matched_skills.filter(s => !s.is_hidden);
            }
        } else {
            // Admin sees Overall Score (with hidden criteria)
            analysis.match_score = analysis.overall_score;
        }

        res.json({
            success: true,
            application,
            analysis
        });

    } catch (error) {
        console.error('Get application details error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch application details', error: error.message });
    }
};
