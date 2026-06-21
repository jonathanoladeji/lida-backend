const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  state: { type: String, required: true },
  lga: { type: String, required: true },
  areaDescription: { type: String, required: true },
  type: { type: String, enum: ['open', 'request-to-join', 'invite-only'], default: 'open' },
  rules: { type: String },
  inviteCode: { type: String },
  gpsLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isSuspended: { type: Boolean, default: false },
  suspendedReason: { type: String },
  memberCount: { type: Number, default: 1 },
  postCount: { type: Number, default: 0 },
  issueCount: { type: Number, default: 0 },
}, { timestamps: true });

communitySchema.index({ name: 'text', areaDescription: 'text' });

module.exports = mongoose.model('Community', communitySchema);
