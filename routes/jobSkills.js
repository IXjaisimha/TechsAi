/**
 * Job Skills Routes - MongoDB Operations
 * Handles job requirements stored in MongoDB
 */

const express = require('express');
const router = express.Router();
const jobSkillsController = require('../controllers/jobSkillsController');
// TODO: Import auth middleware when ready
// const { protect, authorize } = require('../middleware/auth');

// Job Skills Routes
router.post('/:jobId', jobSkillsController.setJobSkills);
router.get('/:jobId', jobSkillsController.getJobSkills);
router.delete('/:jobId', jobSkillsController.deleteJobSkills);

// Internal/Admin Routes (TODO: Add admin authorization)
router.get('/:jobId/internal', jobSkillsController.getJobSkillsInternal);
router.post('/:jobId/hidden', jobSkillsController.addHiddenSkill);

// Search Routes
router.get('/search/query', jobSkillsController.searchJobsBySkill);

module.exports = router;
