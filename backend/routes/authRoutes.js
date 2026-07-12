const express = require('express');
const {
  register,
  login,
  getMe,
  forgotPassword,
  validateResetToken,
  resetPassword,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting configurations
const passwordResetLimiter = rateLimit({
  windowMs: (process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW ? parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW) : 900) * 1000, // 15 mins
  max: process.env.PASSWORD_RESET_RATE_LIMIT ? parseInt(process.env.PASSWORD_RESET_RATE_LIMIT) : 5, // max 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Recovery & password change routes
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', protect, changePassword);

module.exports = router;
