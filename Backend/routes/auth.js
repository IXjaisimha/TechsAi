const express = require('express');
const { body } = require('express-validator');
const { register, login, adminLogin, getMe, registerAdmin, bootstrapAdmin, registerAdminWithSecret, getDashboardStats } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/admin/login', loginValidation, adminLogin);
router.get('/me', protect, getMe);
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/profile', protect, getMe); // /me is basically profile for GET? Or getProfile
// Actually, let's use the new controllers.
const { getProfile, updateProfile } = require('../controllers/authController');
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin registration (protected)
router.post('/register-admin', protect, authorize('ADMIN'), [
  body('name').trim().notEmpty().isLength({ min: 2, max: 50 }),
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 })
], registerAdmin);

// Bootstrap first admin (public, requires ADMIN_INIT_SECRET via header x-admin-init)
router.post('/register-admin/bootstrap', [
  body('name').trim().notEmpty().isLength({ min: 2, max: 50 }),
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 })
], bootstrapAdmin);

// Secret upsert admin (create or update admin using ADMIN_INIT_SECRET)
router.post('/register-admin/secret-upsert', [
  body('name').optional().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 })
], registerAdminWithSecret);

module.exports = router;
