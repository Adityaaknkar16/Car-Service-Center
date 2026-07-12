const Booking = require('../models/Booking');
const Service = require('../models/Service');

// ─── @route  GET /api/bookings ────────────────────────────────────────────────
// ─── @access Private (admin sees all, customer sees own) ──────────────────────
const getAllBookings = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { customer: req.user.id };
    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('service')
      .sort({ appointmentDate: 1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

// ─── @route  GET /api/bookings/:id ───────────────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('service');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Customers can only view their own bookings
    if (req.user.role !== 'admin' && booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// ─── @route  POST /api/bookings ───────────────────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const { serviceId, vehicle, appointmentDate, appointmentTime, notes } = req.body;

    // Verify service exists and is available
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    if (!service.isAvailable) {
      return res.status(400).json({ success: false, message: 'This service is currently unavailable' });
    }

    let parsedVehicle = vehicle;
    if (typeof vehicle === 'string') {
      try {
        parsedVehicle = JSON.parse(vehicle);
      } catch (err) {
        // Keep vehicle as string if parsing fails
      }
    }

    let booking = await Booking.create({
      customer: req.user.id,
      service: serviceId,
      vehicle: parsedVehicle,
      appointmentDate,
      appointmentTime,
      notes,
      totalAmount: service.price,
      images: []
    });

    const fs = require('fs');
    const path = require('path');
    const updatedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const oldPath = file.path;
        const newFilename = file.filename.replace(/^new-/, `${booking._id}-`);
        const newPath = path.join(path.dirname(oldPath), newFilename);
        
        try {
          fs.renameSync(oldPath, newPath);
          updatedImages.push({
            filename: newFilename,
            url: `/uploads/booking-images/${newFilename}`,
            uploadedAt: new Date(),
            status: 'customer_provided'
          });
        } catch (renameErr) {
          updatedImages.push({
            filename: file.filename,
            url: `/uploads/booking-images/${file.filename}`,
            uploadedAt: new Date(),
            status: 'customer_provided'
          });
        }
      }
      booking.images = updatedImages;
      await booking.save();
    }

    booking = await booking.populate('customer', 'name email phone');
    booking = await booking.populate('service');

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// ─── @route  PUT /api/bookings/:id/status ────────────────────────────────────
// ─── @access Private/Admin ───────────────────────────────────────────────────
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, repairNotes } = req.body;
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (repairNotes !== undefined) updateData.repairNotes = repairNotes;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// ─── @route  DELETE /api/bookings/:id ────────────────────────────────────────
// ─── @access Private (customer cancels own) ──────────────────────────────────
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (err) {
    next(err);
  }
};

// ─── @route  POST /api/bookings/:id/repair-progress ───────────────────────────
// ─── @access Private/Admin ───────────────────────────────────────────────────
const uploadRepairProgress = async (req, res, next) => {
  try {
    const { stage, repairNotes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const progressImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        progressImages.push({
          filename: file.filename,
          url: `/uploads/booking-images/${file.filename}`,
          stage: stage || 'inspection',
          uploadedAt: new Date(),
          uploadedBy: req.user.id
        });
      });
    }

    booking.repairProgressImages.push(...progressImages);
    
    if (repairNotes !== undefined) {
      booking.repairNotes = repairNotes;
    }
    
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// ─── @route  GET /api/bookings/:id/images ────────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
const getBookingImages = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: booking.images });
  } catch (err) {
    next(err);
  }
};

// ─── @route  GET /api/bookings/:id/repair-progress ────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
const getRepairProgressImages = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: booking.repairProgressImages });
  } catch (err) {
    next(err);
  }
};

// ─── User Booking History Controllers ─────────────────────────────────────────

// @route  GET /api/bookings/user/current
// @access Private (Customer)
const getCurrentUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('service')
      .sort({ createdAt: -1 });
    
    // Calculate stats
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const totalSpent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: bookings,
      stats: {
        totalBookings,
        completedBookings,
        totalSpent,
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/bookings/user/:userId
// @access Private (Admin, or matching customer)
const getBookingsByUserId = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    if (req.user.role !== 'admin' && req.user.id !== targetUserId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const bookings = await Booking.find({ customer: targetUserId })
      .populate('service')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/bookings/search-by-user
// @access Private/Admin
const searchUsersWithBookings = async (req, res, next) => {
  try {
    const searchTerm = req.query.username || '';
    const limit = parseInt(req.query.limit) || 10;
    const User = require('../models/User');

    // Find users matching search term (name or email)
    const users = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ],
      role: 'customer'
    }).limit(limit);

    // Map each user to include booking stats
    const results = await Promise.all(users.map(async (u) => {
      const count = await Booking.countDocuments({ customer: u._id });
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        bookingCount: count
      };
    }));

    res.status(200).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/bookings/admin/user/:userId/bookings
// @access Private/Admin
const getAdminUserBookingsWithStats = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ customer: userId })
      .populate('service')
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const totalSpent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const User = require('../models/User');
    const userProfile = await User.findById(userId);

    res.status(200).json({
      success: true,
      data: bookings,
      user: userProfile,
      stats: {
        totalBookings,
        completed,
        pending,
        totalSpent
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/bookings/admin/:bookingId/details
// @access Private/Admin
const getAdminBookingDetails = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('customer', 'name email phone')
      .populate('service');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/bookings/admin/user/:userId/export
// @access Private/Admin
const exportUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.params.userId })
      .populate('service')
      .sort({ createdAt: -1 });

    const exportData = bookings.map(b => ({
      BookingID: b._id,
      Service: b.service ? b.service.name : 'Unknown',
      Vehicle: `${b.vehicle.year} ${b.vehicle.make} ${b.vehicle.model} (${b.vehicle.licensePlate})`,
      AppointmentDate: b.appointmentDate.toISOString().split('T')[0],
      AppointmentTime: b.appointmentTime,
      Status: b.status,
      Cost: b.totalAmount,
      Notes: b.notes || '',
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=bookings-${req.params.userId}.csv`);

    // Basic CSV builder
    const headers = ['BookingID', 'Service', 'Vehicle', 'AppointmentDate', 'AppointmentTime', 'Status', 'Cost', 'Notes'];
    const csvRows = [headers.join(',')];
    for (const row of exportData) {
      const values = headers.map(header => {
        const val = row[header];
        const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    res.status(200).send(csvRows.join('\n'));
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/bookings/admin/statistics
// @access Private/Admin
const getAdminDashboardStatistics = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: 'pending' });
    const confirmed = await Booking.countDocuments({ status: 'confirmed' });
    const inProgress = await Booking.countDocuments({ status: 'in-progress' });
    const completed = await Booking.countDocuments({ status: 'completed' });
    const cancelled = await Booking.countDocuments({ status: 'cancelled' });

    // Revenue
    const completedBookings = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pending,
        confirmed,
        inProgress,
        completed,
        cancelled,
        totalRevenue
      }
    });
  } catch (err) {
    next(err);
  }
};

// ─── Phase & Image Upload Controllers ──────────────────────────────────────────

// @route  POST /api/bookings/:bookingId/upload-car-image
// @access Private
const uploadCarConditionImage = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    booking.carConditionImage = {
      filename: req.file.filename,
      url: `/uploads/booking-images/${req.file.filename}`,
      uploadedAt: new Date()
    };

    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/bookings/:bookingId/phases/:phaseIndex/upload-images
// @access Private/Admin
const uploadPhaseImages = async (req, res, next) => {
  try {
    const { bookingId, phaseIndex } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const index = parseInt(phaseIndex);
    if (isNaN(index) || index < 0 || index >= booking.repairPhases.length) {
      return res.status(400).json({ success: false, message: 'Invalid phase index' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload image files' });
    }

    const caption = req.body.caption || '';
    const uploadedImages = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/booking-images/${file.filename}`,
      uploadedAt: new Date(),
      caption
    }));

    booking.repairPhases[index].images.push(...uploadedImages);
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/bookings/:bookingId/add-phases
// @access Private/Admin
const addRepairPhases = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const { phases } = req.body;
    if (!phases || !Array.isArray(phases)) {
      return res.status(400).json({ success: false, message: 'Please provide phases array' });
    }

    booking.repairPhases = phases.map(p => ({
      phaseName: p.phaseName,
      description: p.description || '',
      status: p.status || 'pending',
      images: [],
    }));

    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @route  PATCH /api/bookings/:bookingId/phases/:phaseIndex/status
// @access Private/Admin
const updatePhaseStatus = async (req, res, next) => {
  try {
    const { bookingId, phaseIndex } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const index = parseInt(phaseIndex);
    if (isNaN(index) || index < 0 || index >= booking.repairPhases.length) {
      return res.status(400).json({ success: false, message: 'Invalid phase index' });
    }

    booking.repairPhases[index].status = status;
    if (status === 'in-progress') {
      booking.repairPhases[index].startedAt = new Date();
    } else if (status === 'completed') {
      booking.repairPhases[index].completedAt = new Date();
    }

    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
