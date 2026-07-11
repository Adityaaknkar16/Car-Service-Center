const express = require('express');
const { createEnquiry, getAllEnquiries, markAsRead } = require('../controllers/enquiryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route to submit an enquiry
router.post('/', createEnquiry);

// Admin-only routes
router.get('/', protect, restrictTo('admin'), getAllEnquiries);
router.patch('/:id/read', protect, restrictTo('admin'), markAsRead);

module.exports = router;
