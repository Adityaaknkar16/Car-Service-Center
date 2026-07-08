const Booking = require('../models/Booking');
const Service = require('../models/Service');

// ─── @route  GET /api/bookings ────────────────────────────────────────────────
// ─── @access Private (admin sees all, customer sees own) ──────────────────────
const getAllBookings = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { customer: req.user.id };
    const bookings = await Booking.find(filter).sort({ appointmentDate: 1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

// ─── @route  GET /api/bookings/:id ───────────────────────────────────────────
// ─── @access Private ──────────────────────────────────────────────────────────
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
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

    const booking = await Booking.create({
      customer: req.user.id,
      service: serviceId,
      vehicle,
      appointmentDate,
      appointmentTime,
      notes,
      totalAmount: service.price,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// ─── @route  PUT /api/bookings/:id/status ────────────────────────────────────
// ─── @access Private/Admin ───────────────────────────────────────────────────
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
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

module.exports = { getAllBookings, getBookingById, createBooking, updateBookingStatus, cancelBooking };
