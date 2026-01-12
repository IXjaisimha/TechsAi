const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config/config');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
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
    const token = generateToken(user.user_id);

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
    const token = generateToken(user.user_id);

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

    const token = generateToken(user.user_id);

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

    const token = generateToken(user.user_id);
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

    const token = generateToken(user.user_id);
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

    const token = generateToken(user.user_id);
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
