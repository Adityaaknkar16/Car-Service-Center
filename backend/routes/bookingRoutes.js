const express = require('express');
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  uploadRepairProgress,
  getBookingImages,
  getRepairProgressImages
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

const router = express.Router();

// All booking routes require authentication
router.use(protect);

router.get('/', getAllBookings);
router.post('/', upload.array('images', 4), createBooking);
router.get('/:id', getBookingById);
router.put('/:id/status', restrictTo('admin'), updateBookingStatus);
router.put('/:id/cancel', cancelBooking);

// New endpoints for image upload & retrieval
router.post('/:id/repair-progress', restrictTo('admin'), upload.array('images', 5), uploadRepairProgress);
router.get('/:id/images', getBookingImages);
router.get('/:id/repair-progress', getRepairProgressImages);

module.exports = router;
