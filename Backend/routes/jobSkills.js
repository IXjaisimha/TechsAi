/**
 * Job Skills Routes - MongoDB Operations
 * Handles job requirements stored in MongoDB
 */

const express = require('express');
const router = express.Router();
const jobSkillsController = require('../controllers/jobSkillsController');
const { protect, authorize } = require('../middleware/auth');

// Job Skills Routes
router.get('/', protect, jobSkillsController.getAllJobSkills);
router.post('/:jobId', protect, authorize('ADMIN'), jobSkillsController.setJobSkills);
router.get('/:jobId', jobSkillsController.getJobSkills); // Public read potentially? Or protected? Keeping public for search visibility usually, or protect if internal. Let's protect modify.
router.delete('/:jobId', protect, authorize('ADMIN'), jobSkillsController.deleteJobSkills);

// Internal/Admin Routes
router.get('/:jobId/internal', protect, authorize('ADMIN'), jobSkillsController.getJobSkillsInternal);
router.post('/:jobId/hidden', protect, authorize('ADMIN'), jobSkillsController.addHiddenSkill);

// Search Routes
router.get('/search/query', jobSkillsController.searchJobsBySkill);

module.exports = router;
