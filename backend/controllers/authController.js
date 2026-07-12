const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Helper: build response payload ──────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
// ─── @access Public ───────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password, phone });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── @route  POST /api/auth/login ─────────────────────────────────────────────
// ─── @access Public ───────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── @route  GET /api/auth/me ──────────────────────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─── Forgot Password Controllers ───────────────────────────────────────────────
const PasswordReset = require('../models/PasswordReset');
const { generateResetToken } = require('../utils/tokenGenerator');
const sendEmail = require('../utils/sendEmail');
const { getPasswordResetTemplate, getPasswordChangedTemplate } = require('../utils/emailTemplates');

// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const genericMessage = 'If an account with that email exists, a reset link has been sent.';

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Security: Do not reveal if email is not registered
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const { token, hashedToken } = generateResetToken();
    const expiryTime = Date.now() + (process.env.PASSWORD_RESET_TOKEN_EXPIRY ? parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY) * 1000 : 3600000); // default 1 hour
    const expiresAt = new Date(expiryTime);

    // Save tokens in both User model (compatibility/backup) and PasswordReset log
    user.setPasswordResetToken(hashedToken, expiresAt);
    await user.save();

    await PasswordReset.create({
      userId: user._id,
      email: user.email,
      resetToken: token,
      tokenHash: hashedToken,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    const emailHtml = getPasswordResetTemplate(user.name, resetLink);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Velocity Studio – Password Reset Request',
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
      // Do not fail the endpoint response if email transmission failed, but log it
    }

    res.status(200).json({ success: true, message: genericMessage });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/auth/reset-password/:token
// @access Public
const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Token invalid or expired.' });
    }

    res.status(200).json({ success: true, valid: true });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/reset-password/:token
// @access Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password'); // select password to update it correctly

    if (!user) {
      return res.status(400).json({ success: false, error: 'Token invalid or expired.' });
    }

    user.setNewPassword(newPassword);
    await user.save();

    // Mark password reset records as used
    await PasswordReset.updateMany(
      { tokenHash: hashedToken },
      { isUsed: true, usedAt: new Date() }
    );

    // Send confirmation email
    const emailHtml = getPasswordChangedTemplate(user.name);
    try {
      await sendEmail({
        email: user.email,
        subject: 'Velocity Studio – Password Successfully Reset',
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error('Failed to send password reset confirmation email:', emailErr);
    }

    res.status(200).json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/change-password
// @access Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Please provide all details. Password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  validateResetToken,
  resetPassword,
  changePassword,
};
