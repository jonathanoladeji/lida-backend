const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  role: { type: String, enum: ['member', 'moderator'], default: 'member' },
  status: { type: String, enum: ['active', 'pending', 'rejected', 'banned'], default: 'active' },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

membershipSchema.index({ user: 1, community: 1 }, { unique: true });

module.exports = mongoose.model('Membership', membershipSchema);
