const express = require('express');
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Admin-only routes
router.post('/', protect, restrictTo('admin'), createService);
router.put('/:id', protect, restrictTo('admin'), updateService);
router.delete('/:id', protect, restrictTo('admin'), deleteService);

module.exports = router;
