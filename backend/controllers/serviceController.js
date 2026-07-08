const Service = require('../models/Service');

// ─── @route  GET /api/services ────────────────────────────────────────────────
// ─── @access Public ───────────────────────────────────────────────────────────
const getAllServices = async (req, res, next) => {
  try {
    const { category, available } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.isAvailable = available === 'true';

    const services = await Service.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (err) {
    next(err);
  }
};

// ─── @route  GET /api/services/:id ───────────────────────────────────────────
// ─── @access Public ───────────────────────────────────────────────────────────
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

// ─── @route  POST /api/services ──────────────────────────────────────────────
// ─── @access Private/Admin ───────────────────────────────────────────────────
const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

// ─── @route  PUT /api/services/:id ───────────────────────────────────────────
// ─── @access Private/Admin ───────────────────────────────────────────────────
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

// ─── @route  DELETE /api/services/:id ────────────────────────────────────────
// ─── @access Private/Admin ───────────────────────────────────────────────────
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };
