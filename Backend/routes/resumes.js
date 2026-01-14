/**
 * Resume Routes
 * Handles resume uploads and AI skill extraction
 */

const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const upload = require('../config/multerConfig');
const { protect, authorize } = require('../middleware/auth');

/**
 * Resume Upload & AI Extraction
 * POST /api/resumes/upload
 * Body: multipart/form-data
 *   - file OR File: Resume file (PDF/DOC/DOCX)
 *   - user_id: User ID (required)
 */
router.post('/upload', protect, authorize('USER'), upload.any(), resumeController.uploadAndExtract);

/**
 * Get all resumes for user
 * GET /api/resumes
 */
router.get('/', protect, authorize('USER'), resumeController.getAllResumes);

/**
 * Get extracted skills from resume
 * GET /api/resumes/:resumeId/skills
 */
router.get('/:resumeId/skills', protect, resumeController.getResumeSkills);

/**
 * Re-extract skills from existing resume
 * POST /api/resumes/:resumeId/re-extract
 */
router.post('/:resumeId/re-extract', protect, resumeController.reExtractSkills);

/**
 * Bulk extract from all uploaded resumes
 * POST /api/resumes/bulk-extract
 */
router.post('/bulk-extract', protect, resumeController.bulkExtract);

/**
 * Delete resume
 * DELETE /api/resumes/:resumeId
 */
router.delete('/:resumeId', protect, resumeController.deleteResume);

module.exports = router;
