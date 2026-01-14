const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rankingController');

// Rank candidates for a job
router.get('/jobs/:job_id/rank', ctrl.rankByJob);

module.exports = router;