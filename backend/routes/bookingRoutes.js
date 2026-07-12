const express = require('express');
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  uploadRepairProgress,
  getBookingImages,
  getRepairProgressImages,
  getCurrentUserBookings,
  getBookingsByUserId,
  searchUsersWithBookings,
  getAdminUserBookingsWithStats,
  getAdminBookingDetails,
  exportUserBookings,
  getAdminDashboardStatistics,
  uploadCarConditionImage,
  uploadPhaseImages,
  addRepairPhases,
  updatePhaseStatus,
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// Admin-only stats and search (put specific routes first to avoid parameter collision)
router.get('/admin/statistics', restrictTo('admin'), getAdminDashboardStatistics);
router.get('/search-by-user', restrictTo('admin'), searchUsersWithBookings);
router.get('/admin/user/:userId/bookings', restrictTo('admin'), getAdminUserBookingsWithStats);
router.get('/admin/user/:userId/export', restrictTo('admin'), exportUserBookings);
router.get('/admin/:bookingId/details', restrictTo('admin'), getAdminBookingDetails);

// Customer specific history
router.get('/user/current', getCurrentUserBookings);
router.get('/user/:userId', getBookingsByUserId);

// Core Booking resource routes
router.get('/', getAllBookings);
router.post('/', upload.array('images', 4), createBooking);
router.get('/:id', getBookingById);
router.put('/:id/status', restrictTo('admin'), updateBookingStatus);
router.put('/:id/cancel', cancelBooking);

// Progress & Phase routes
router.post('/:id/repair-progress', restrictTo('admin'), upload.array('images', 5), uploadRepairProgress);
router.get('/:id/images', getBookingImages);
router.get('/:id/repair-progress', getRepairProgressImages);

// Car condition and repair phase upload endpoints
router.post('/:bookingId/upload-car-image', upload.single('image'), uploadCarConditionImage);
router.post('/:bookingId/phases/:phaseIndex/upload-images', restrictTo('admin'), upload.array('images', 5), uploadPhaseImages);
router.post('/:bookingId/add-phases', restrictTo('admin'), addRepairPhases);
router.patch('/:bookingId/phases/:phaseIndex/status', restrictTo('admin'), updatePhaseStatus);

module.exports = router;
