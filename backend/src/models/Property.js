const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceUnit: {
      type: String,
      enum: ['Lakh', 'Crore'],
      default: 'Lakh',
    },
    type: {
      type: String,
      enum: ['Apartment', 'Villa', 'Studio', 'Penthouse', 'Plot'],
      required: true,
    },
    bhk: {
      type: Number,
      required: true,
    },
    sqft: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Ready to Move', 'Under Construction', 'New Launch'],
      required: true,
    },
    location: {
      city: { type: String, required: true },
      area: { type: String, required: true },
      state: { type: String, required: true },
      address: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    builder: {
      name: { type: String, required: true },
      phone: { type: String, default: '+91 9876543210' },
      email: { type: String, default: 'builder@realestate.com' },
      rating: { type: Number, default: 4.5, min: 1, max: 5 },
      experience: { type: String, default: '10 years' },
    },
    constructionProgress: {
      startDate: { type: Date },
      endDate: { type: Date },
      currentStage: { type: Number, default: 1 },
      completionPercent: { type: Number, default: 0 },
      stages: [
        {
          id: Number,
          title: String,
          icon: String,
          status: {
            type: String,
            enum: ['Completed', 'In Progress', 'Upcoming'],
            default: 'Upcoming',
          },
        },
      ],
    },
    tags: {
      type: [String],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.0,
    },
  },
  { timestamps: true }
);

// Index for search
propertySchema.index({ title: 'text', description: 'text', 'location.city': 'text', 'location.area': 'text' });

module.exports = mongoose.model('Property', propertySchema);
