const express = require('express');
const router = express.Router();
const { Poll, PollVote } = require('../models/Poll');
const { protect } = require('../middleware/auth');

// GET /api/polls/community/:communityId
router.get('/community/:communityId', protect, async (req, res, next) => {
  try {
    const polls = await Poll.find({ community: req.params.communityId })
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
      community,
      question,
      options: options.map(text => ({ text, votes: 0 })),
      closingDate,
      isAnonymous,
      linkedIssue,
      author: req.user._id,
    });
    await poll.populate('author', 'fullName');
    res.status(201).json({ poll });
  } catch (err) {
    next(err);
  }
});

// POST /api/polls/:id/vote
router.post('/:id/vote', protect, async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.isClosed || new Date() > poll.closingDate) {
      poll.isClosed = true;
      await poll.save();
      return res.status(400).json({ message: 'Poll is closed' });
    }

    const { optionIndex } = req.body;
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option' });
    }

    const existing = await PollVote.findOne({ poll: poll._id, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already voted' });

    await PollVote.create({ poll: poll._id, user: req.user._id, optionIndex });
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    await poll.save();

    res.json({ poll, voted: true, optionIndex });
  } catch (err) {
    next(err);
  }
});

// GET /api/polls/:id/my-vote
router.get('/:id/my-vote', protect, async (req, res, next) => {
  try {
    const vote = await PollVote.findOne({ poll: req.params.id, user: req.user._id });
    res.json({ vote: vote ? { optionIndex: vote.optionIndex } : null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
