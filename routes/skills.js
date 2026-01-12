/**
 * Skills Routes - MongoDB Operations
 * Handles resume skills stored in MongoDB
 */

const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillsController');
// TODO: Import auth middleware when ready
// const { protect } = require('../middleware/auth');

// Resume Skills Routes
router.post('/resume/:resumeId', skillsController.addResumeSkills);
router.get('/resume/:resumeId', skillsController.getResumeSkills);
router.patch('/resume/:resumeId/skill/:skillName', skillsController.updateResumeSkill);
router.delete('/resume/:resumeId', skillsController.deleteResumeSkills);

// Search Routes
router.get('/search', skillsController.searchResumesBySkill);

module.exports = router;
