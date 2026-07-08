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
    // Car details provided at time of booking
    vehicle: {
      make: { type: String, required: true, trim: true },
      model: { type: String, required: true, trim: true },
      year: {
        type: Number,
        required: true,
        min: [1900, 'Year must be 1900 or later'],
        max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
      },
      licensePlate: { type: String, trim: true, uppercase: true },
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String, // e.g. "10:00 AM"
      required: [true, 'Appointment time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
      default: '',
    },
    totalAmount: {
      type: Number,
      min: [0, 'Amount cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-populate customer and service when querying
bookingSchema.pre(/^find/, function (next) {
  this.populate('customer', 'name email phone').populate('service', 'name price estimatedDuration');
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
