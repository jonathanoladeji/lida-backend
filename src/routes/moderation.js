const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const Community = require('../models/Community');
const { protect } = require('../middleware/auth');

// GET /api/moderation/join-requests/:communityId
router.get('/join-requests/:communityId', protect, async (req, res, next) => {
  try {
    const requests = await Membership.find({
      community: req.params.communityId,
      status: 'pending',
    }).populate('user', 'fullName email neighbourhood state lga');
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

// POST /api/moderation/approve-join/:membershipId
router.post('/approve-join/:membershipId', protect, async (req, res, next) => {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.membershipId,
      { status: 'active' },
      { new: true }
    );
    if (!membership) return res.status(404).json({ message: 'Request not found' });
    await Community.findByIdAndUpdate(membership.community, { $inc: { memberCount: 1 } });
    res.json({ membership });
  } catch (err) {
    next(err);
  }
});

// POST /api/moderation/promote/:communityId/:userId
router.post('/promote/:communityId/:userId', protect, async (req, res, next) => {
  try {
    const membership = await Membership.findOneAndUpdate(
      { user: req.params.userId, community: req.params.communityId, status: 'active' },
      { role: 'moderator' },
      { new: true }
    ).populate('user', 'fullName email');
    if (!membership) return res.status(404).json({ message: 'Member not found' });
    res.json({ membership });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
