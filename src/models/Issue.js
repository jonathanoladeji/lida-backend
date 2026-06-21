const mongoose = require('mongoose');

const issueCommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
}, { timestamps: true });

const issueSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['water', 'electricity', 'roads', 'sanitation', 'security concern', 'flooding', 'health', 'environment', 'other'],
    required: true
  },
  description: { type: String, required: true },
  locationDescription: { type: String },
  imageUrl: { type: String },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'under review', 'action planned', 'resolved'], default: 'open' },
  supporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  supportCount: { type: Number, default: 0 },
  comments: [issueCommentSchema],
  affectedHouseholds: { type: Number, default: 0 },
  attachedPoll: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll' },
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
