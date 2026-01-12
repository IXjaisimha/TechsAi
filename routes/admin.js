/**
 * Admin Routes
 * Routes for admin to access resumes and user data
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/admin/resumes
 * @desc    Get all resumes with user info
 * @access  Admin only
 */
router.get('/resumes', protect, authorize('ADMIN'), adminController.getAllResumes);

/**
 * @route   GET /api/admin/resumes/:resume_id
 * @desc    Get single resume with AI skills
 * @access  Admin only
 */
router.get('/resumes/:resume_id', protect, authorize('ADMIN'), adminController.getResumeDetails);

/**
 * @route   GET /api/admin/resumes/:resume_id/download
 * @desc    Download resume file
 * @access  Admin only
 */
router.get('/resumes/:resume_id/download', protect, authorize('ADMIN'), adminController.downloadResume);

/**
 * @route   GET /api/admin/users/:user_id/resumes
 * @desc    Get all resumes for specific user
 * @access  Admin only
 */
router.get('/users/:user_id/resumes', protect, authorize('ADMIN'), adminController.getResumesByUser);

/**
 * @route   DELETE /api/admin/resumes/:resume_id
 * @desc    Delete resume (MySQL + MongoDB + File System)
 * @access  Admin only
 */
router.delete('/resumes/:resume_id', protect, authorize('ADMIN'), adminController.deleteResume);

/**
 * @route   POST /api/admin/jobs
 * @desc    Create new job with JD and hidden requirements
 * @access  Admin only
 */
router.post('/jobs', protect, authorize('ADMIN'), adminController.createJob);

/**
 * @route   GET /api/admin/jobs
 * @desc    Get all jobs
 * @access  Admin only
 */
router.get('/jobs', protect, authorize('ADMIN'), adminController.getAllJobs);

/**
 * @route   GET /api/admin/jobs/:job_id
 * @desc    Get single job details
 * @access  Admin only
 */
router.get('/jobs/:job_id', protect, authorize('ADMIN'), adminController.getJobDetails);

/**
 * @route   PUT /api/admin/jobs/:job_id
 * @desc    Update job
 * @access  Admin only
 */
router.put('/jobs/:job_id', protect, authorize('ADMIN'), adminController.updateJob);

/**
 * @route   DELETE /api/admin/jobs/:job_id
 * @desc    Delete job
 * @access  Admin only
 */
router.delete('/jobs/:job_id', protect, authorize('ADMIN'), adminController.deleteJob);

/**
 * @route   POST /api/admin/match/resume/:resume_id/job/:job_id
 * @desc    Run AI matching between resume and job
 * @access  Admin only
 */
router.post('/match/resume/:resume_id/job/:job_id', protect, authorize('ADMIN'), adminController.runAIMatching);

/**
 * @route   GET /api/admin/jobs/:job_id/matches
 * @desc    Get all match results for a job (sorted by score)
 * @access  Admin only
 */
router.get('/jobs/:job_id/matches', protect, authorize('ADMIN'), adminController.getJobMatches);

/**
 * @route   GET /api/admin/match/:application_id
 * @desc    Get detailed match result for an application (includes hidden analysis)
 * @access  Admin only
 */
router.get('/match/:application_id', protect, authorize('ADMIN'), adminController.getMatchDetails);

module.exports = router;