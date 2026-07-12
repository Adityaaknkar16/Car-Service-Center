const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    resetToken: {
      type: String,
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);

// Method to mark a token as used
passwordResetSchema.methods.markAsUsed = function () {
  this.isUsed = true;
  this.usedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
