const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Optional: if we want to force login to see jobs
const { getAllJobs, getJobById } = require('../controllers/jobController');

// Public or Protected? UserDashboard sends token, so let's protect it or allow both.
// Requirement: "visible to seekers". Usually implies login.
router.get('/', protect, getAllJobs);
router.get('/:job_id', protect, getJobById);

module.exports = router;
