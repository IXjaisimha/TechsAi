const { User, Job, Resume, Application, AIMatchResult } = require('../models');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config/config');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({
    id: user.user_id,
    name: user.full_name,
    role: user.role
  }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    user = await User.create({
      full_name: name,
      email,
      password_hash: password,
      role: role || 'USER',
      status: 'ACTIVE'
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and include password for comparison
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Admin login (requires role ADMIN)
// @route   POST /api/auth/admin/login
// @access  Public (role-checked)
exports.adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during admin login', error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Register a new admin (protected)
// @route   POST /api/auth/register-admin
// @access  Admin only
exports.registerAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Only admins can create other admins via this endpoint
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: admin privileges required' });
    }

    const name = (req.body.name || process.env.DEFAULT_ADMIN_NAME || 'Default Admin').trim();
    const email = (req.body.email || process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const password = (req.body.password || process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123');

    let existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      full_name: name,
      email,
      password_hash: password,
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Register admin error:', error);
    return res.status(500).json({ success: false, message: 'Server error during admin registration', error: error.message });
  }
};

// @desc    Bootstrap first admin (public, guarded by secret, only when no admins exist)
// @route   POST /api/auth/register-admin/bootstrap
// @access  Public (requires ADMIN_INIT_SECRET header)
exports.bootstrapAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const adminCount = await User.count({ where: { role: 'ADMIN' } });
    if (adminCount > 0) {
      return res.status(403).json({ success: false, message: 'Bootstrap denied: admin already exists' });
    }

    const initSecret = process.env.ADMIN_INIT_SECRET;
    const provided = req.headers['x-admin-init'];
    if (!initSecret || !provided || provided !== initSecret) {
      return res.status(403).json({ success: false, message: 'Forbidden: invalid or missing admin init secret' });
    }

    const { name, email, password } = req.body;

    let existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      full_name: name,
      email,
      password_hash: password,
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      message: 'Initial admin created successfully',
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Bootstrap admin error:', error);
    return res.status(500).json({ success: false, message: 'Server error during admin bootstrap', error: error.message });
  }
};

// @desc    Upsert admin using init secret (create or update password)
// @route   POST /api/auth/register-admin/secret-upsert
// @access  Public (requires ADMIN_INIT_SECRET)
exports.registerAdminWithSecret = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const initSecret = process.env.ADMIN_INIT_SECRET;
    const provided = req.headers['x-admin-init'];
    if (!initSecret || !provided || provided !== initSecret) {
      return res.status(403).json({ success: false, message: 'Forbidden: invalid or missing admin init secret' });
    }

    const name = (req.body.name || process.env.DEFAULT_ADMIN_NAME || 'Default Admin').trim();
    const email = (req.body.email || process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const password = (req.body.password || process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123');

    let user = await User.findOne({ where: { email } });
    if (user) {
      // Update to ADMIN role and reset password
      user.full_name = name;
      user.role = 'ADMIN';
      user.password_hash = password; // will be hashed by hook on update
      await user.save();
    } else {
      user = await User.create({
        full_name: name,
        email,
        password_hash: password,
        role: 'ADMIN',
        status: 'ACTIVE'
      });
    }

    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      message: 'Admin upserted successfully',
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Secret admin upsert error:', error);
    return res.status(500).json({ success: false, message: 'Server error during secret admin upsert', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'admin_id'] } // Security
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Allowed fields to update
    if (req.body.full_name) user.full_name = req.body.full_name;
    if (req.body.email) user.email = req.body.email; // Should verify uniqueness if changing email?

    // Simple password update (for now/demo)
    if (req.body.password) {
      user.password_hash = req.body.password; // Hook hashes it
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get dashboard statistics for current user
// @route   GET /api/auth/dashboard-stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const user_id = req.user.id; // Using user_id not id
    const role = req.user.role;

    let stats = [];

    if (role === 'ADMIN') {
      const candidatesCount = await User.count({ where: { role: 'USER' } });
      const activeJobsCount = await Job.count({ where: { job_status: 'OPEN' } });
      const matchesCount = await AIMatchResult.countDocuments();
      const applicationsCount = await Application.count();

      stats = [
        { title: 'Total Candidates', value: candidatesCount.toString(), icon: 'Users', color: 'text-blue-500' },
        { title: 'Active Jobs', value: activeJobsCount.toString(), icon: 'Briefcase', color: 'text-indigo-500' },
        { title: 'Matches Found', value: matchesCount.toString(), icon: 'Zap', color: 'text-amber-500' },
        { title: 'Total Applications', value: applicationsCount.toString(), icon: 'FileText', color: 'text-emerald-500' },
      ];
    } else {
      // User Stats
      const myResumesCount = await Resume.count({ where: { user_id } });
      const jobsAppliedCount = await Application.count({ where: { user_id } });
      const matchesCount = await AIMatchResult.countDocuments({ user_id });

      stats = [
        { title: 'My Resumes', value: myResumesCount.toString(), icon: 'FileText', color: 'text-blue-500' },
        { title: 'Jobs Applied', value: jobsAppliedCount.toString(), icon: 'Briefcase', color: 'text-indigo-500' },
        { title: 'Profile Matches', value: matchesCount.toString(), icon: 'Zap', color: 'text-amber-500' },
        { title: 'Profile Views', value: '12', icon: 'Users', color: 'text-emerald-500' },
      ];
    }

    // Get recent activity
    let recentActivity = [];
    if (role === 'ADMIN') {
      const recentApps = await Application.findAll({
        limit: 5,
        order: [['applied_at', 'DESC']],
        include: [{ model: User, attributes: ['full_name'] }, { model: Job, attributes: ['job_title'] }]
      });
      recentActivity = recentApps.map(app => ({
        id: app.application_id,
        text: `${app.User?.full_name} applied for ${app.Job?.job_title}`,
        time: app.applied_at
      }));
    } else {
      const recentResumes = await Resume.findAll({
        where: { user_id },
        limit: 5,
        order: [['uploaded_at', 'DESC']]
      });
      recentActivity = recentResumes.map(r => ({
        id: r.resume_id,
        text: `Uploaded resume: ${r.file_name}`, // Corrected: original_name not file_name? Model uses original_name usually
        time: r.uploaded_at
      }));
    }

    res.status(200).json({
      success: true,
      stats,
      recentActivity
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};
