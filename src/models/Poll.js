const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  options: [pollOptionSchema],
  closingDate: { type: Date, required: true },
  isAnonymous: { type: Boolean, default: false },
  resultsVisibleAfterVoting: { type: Boolean, default: true },
  totalVotes: { type: Number, default: 0 },
  isClosed: { type: Boolean, default: false },
  linkedIssue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
}, { timestamps: true });

const pollVoteSchema = new mongoose.Schema({
  poll: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  optionIndex: { type: Number, required: true },
}, { timestamps: true });

pollVoteSchema.index({ poll: 1, user: 1 }, { unique: true });

const Poll = mongoose.model('Poll', pollSchema);
const PollVote = mongoose.model('PollVote', pollVoteSchema);

module.exports = { Poll, PollVote };
