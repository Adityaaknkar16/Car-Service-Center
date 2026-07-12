const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Ensure password isn't returned by default in queries
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Set password reset token
userSchema.methods.setPasswordResetToken = function (hashedToken, expiresAt) {
  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = expiresAt;
};

// Clear password reset token
userSchema.methods.clearPasswordResetToken = function () {
  this.passwordResetToken = null;
  this.passwordResetExpires = null;
};

// Check if reset token is valid
userSchema.methods.isResetTokenValid = function (expires) {
  return this.passwordResetExpires && this.passwordResetExpires > Date.now();
};

// Set new password and update passwordChangedAt
userSchema.methods.setNewPassword = function (newPassword) {
  this.password = newPassword;
  this.passwordChangedAt = Date.now();
  this.clearPasswordResetToken();
};

module.exports = mongoose.model('User', userSchema);

