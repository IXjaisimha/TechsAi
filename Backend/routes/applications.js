const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multerConfig');

// Analyze resume against job
// POST /api/applications/analyze
// Uses upload.any() because client sends form-data with file
router.post('/analyze', protect, upload.any(), applicationController.analyzeApplication);

// Submit application
// POST /api/applications/apply
router.post('/apply', protect, upload.any(), applicationController.submitApplication);

// Get user applications
router.get('/my', protect, applicationController.getUserApplications);

// Get single application details
router.get('/:id', protect, applicationController.getApplicationDetails);

module.exports = router;
