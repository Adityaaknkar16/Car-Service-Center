const Enquiry = require('../models/Enquiry');

// ─── @route  POST /api/enquiries ─────────────────────────────────────────────
// ─── @access Public ───────────────────────────────────────────────────────────
const createEnquiry = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and message' });
    }

    const enquiry = await Enquiry.create({ name, email, message });
    res.status(201).json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};

// ─── @route  GET /api/enquiries ──────────────────────────────────────────────
// ─── @access Private/Admin ───────────────────────────────────────────────────
const getAllEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    next(err);
  }
};

// ─── @route  PATCH /api/enquiries/:id/read ────────────────────────────────────
// ─── @access Private/Admin ───────────────────────────────────────────────────
const markAsRead = async (req, res, next) => {
  try {
    const { isRead } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { isRead: isRead !== undefined ? isRead : true },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    res.status(200).json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};

module.exports = { createEnquiry, getAllEnquiries, markAsRead };
