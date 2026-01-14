const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/jobAnalysisController');

// Analyze JD + hidden requirements for a job
router.post('/:job_id/analyze', ctrl.analyzeAndSave);
router.post('/analyze', ctrl.analyzeRawJD);

module.exports = router;