const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
    },
    vehicle: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      licensePlate: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time slot is required'],
    },
    notes: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    images: [{
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
      status: { type: String, default: 'customer_provided' }
    }],
    repairProgressImages: [{
      filename: String,
      url: String,
      stage: String,
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    repairNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

