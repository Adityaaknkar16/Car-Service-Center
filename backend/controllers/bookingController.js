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

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  uploadRepairProgress,
  getBookingImages,
  getRepairProgressImages
};
