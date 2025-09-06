import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  maxFeaturedProducts: {
    type: Number,
    default: 6,
  },
  maxTrendingProducts: {
    type: Number,
    default: 8,
  },
  siteName: {
    type: String,
    default: 'Anabeya Collection',
  },
  siteDescription: {
    type: String,
    default: 'Premium handmade clothing collection',
  },
  contactEmail: {
    type: String,
    default: 'contact@anabeya.com',
  },
  contactPhone: {
    type: String,
    default: '+1234567890',
  },
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);