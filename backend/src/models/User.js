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
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    locationPreference: {
      type: String,
      default: 'Mumbai',
    },
    preferredTypes: {
      type: [String],
      default: [],
    },
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10000000 },
    },
    notificationPrefs: {
      newPropertyAlerts: { type: Boolean, default: true },
      priceDropAlerts: { type: Boolean, default: true },
      siteVisitReminders: { type: Boolean, default: true },
      builderMessages: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
