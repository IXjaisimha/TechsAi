const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/matchingController');

// Compute match and persist result
router.post('/match', ctrl.match);

module.exports = router;