/**
 * AI Match Routes - MongoDB Operations
 * Handles AI-generated match results stored in MongoDB
 */

const express = require('express');
const router = express.Router();
const aiMatchController = require('../controllers/aiMatchController');
// TODO: Import auth middleware when ready
// const { protect } = require('../middleware/auth');

// Match Result Routes
router.post('/', aiMatchController.createMatchResult);
router.get('/application/:applicationId', aiMatchController.getMatchByApplication);
router.get('/application/:applicationId/complete', aiMatchController.getCompleteMatchAnalysis);
router.delete('/:applicationId', aiMatchController.deleteMatchResult);

// User Matches
router.get('/user/:userId', aiMatchController.getUserMatches);

// Job Matches
router.get('/job/:jobId/top', aiMatchController.getTopMatchesForJob);
router.get('/job/:jobId/stats', aiMatchController.getJobMatchStats);

module.exports = router;
