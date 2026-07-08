const express = require('express');
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All booking routes require authentication
router.use(protect);

router.get('/', getAllBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.put('/:id/status', restrictTo('admin'), updateBookingStatus);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
