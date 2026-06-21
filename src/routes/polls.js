const express = require('express');
const router = express.Router();
const { Poll, PollVote } = require('../models/Poll');
const { protect } = require('../middleware/auth');

// GET /api/polls?community_id=x
router.get('/', protect, async (req, res, next) => {
  try {
    const { community_id } = req.query;
    const query = {};
    if (community_id) query.community = community_id;
    const polls = await Poll.find(query)
      .populate('author', 'fullName')
      .sort({ createdAt: -1 });
    res.json({ polls });
  } catch (err) {
    next(err);
  }
});

// POST /api/polls
router.post('/', protect, async (req, res, next) => {
  try {
    const { community, question, options, closingDate, isAnonymous, linkedIssue } = req.body;
    const poll = await Poll.create({
      community, question,
      options: options.map(text => ({ text, votes: 0 })),
      closingDate, isAnonymous, linkedIssue,
      author: req.user._id,
    });
    await poll.populate('author', 'fullName');
    res.status(201).json({ poll });
  } catch (err) {
    next(err);
  }
});

// POST /api/polls/vote
router.post('/vote', protect, async (req, res, next) => {
  try {
    const { poll_id, option_index } = req.body;
    const poll = await Poll.findById(poll_id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.isClosed || new Date() > poll.closingDate) {
      return res.status(400).json({ message: 'Poll is closed' });
    }
    const existing = await PollVote.findOne({ poll: poll._id, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already voted' });

    await PollVote.create({ poll: poll._id, user: req.user._id, optionIndex: option_index });
    poll.options[option_index].votes += 1;
    poll.totalVotes += 1;
    await poll.save();
    res.json({ poll, voted: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
