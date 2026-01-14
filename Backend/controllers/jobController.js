/**
 * Job Controller
 * Public endpoints for viewing jobs
 */

const { Job, User, JobSkill } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all open jobs (Public / User)
 * GET /api/jobs
 */
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            where: { job_status: 'OPEN' },
            include: [{
                model: User,
                attributes: ['full_name', 'email'] // Company/Admin info
            }],
            order: [['created_at', 'DESC']]
        });

        // We might want to attach skills here too, but for performance, 
        // maybe only on details page. For now, let's return jobs.
        // If frontend needs skills for search, we can fetch them or leave it for now.
        // The current UserDashboard filters by skills in 'visible_jd.skills'.
        // We should probably fetch skills if we want search to work fully, 
        // but let's stick to basic display first.

        res.status(200).json(jobs);
    } catch (error) {
        console.error('Public - Get all jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve jobs',
            error: error.message
        });
    }
};

/**
 * Get single job details
 * GET /api/jobs/:job_id
 */
exports.getJobById = async (req, res) => {
    try {
        const { job_id } = req.params;

        const job = await Job.findOne({
            where: {
                job_id,
                // job_status: 'OPEN' // Maybe allow viewing closed jobs if direct link?
            },
            include: [{
                model: User,
                attributes: ['full_name', 'email']
            }]
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Get skills from MongoDB
        const jobSkills = await JobSkill.findOne({ job_id: Number(job_id) });

        res.status(200).json({
            ...job.toJSON(),
            skills: jobSkills ? jobSkills.normal_skills : []
        });
    } catch (error) {
        console.error('Public - Get job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve job details',
            error: error.message
        });
    }
};
