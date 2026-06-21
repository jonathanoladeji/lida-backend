const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const { protect, requireModerator } = require('../middleware/auth');

// GET /api/members/community/:communityId
router.get('/community/:communityId', protect, async (req, res, next) => {
  try {
    const members = await Membership.find({
      community: req.params.communityId,
      status: 'active',
    }).populate('user', 'fullName email neighbourhood state lga createdAt');
    res.json({ members });
  } catch (err) {
    next(err);
  }
});

// GET /api/members/my-communities
router.get('/my-communities', protect, async (req, res, next) => {
  try {
    const memberships = await Membership.find({
      user: req.user._id,
      status: 'active',
    }).populate('community');
    res.json({ memberships });
  } catch (err) {
    next(err);
  }
});

// GET /api/members/community/:communityId/my-membership
router.get('/community/:communityId/my-membership', protect, async (req, res, next) => {
  try {
    const membership = await Membership.findOne({
      user: req.user._id,
      community: req.params.communityId,
    });
    res.json({ membership });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/members/:communityId/:userId/promote (moderator)
router.patch('/:communityId/:userId/promote', protect, requireModerator, async (req, res, next) => {
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

// PATCH /api/members/:communityId/:userId/ban (moderator)
router.patch('/:communityId/:userId/ban', protect, requireModerator, async (req, res, next) => {
  try {
    const membership = await Membership.findOneAndUpdate(
      { user: req.params.userId, community: req.params.communityId },
      { status: 'banned' },
      { new: true }
    );
    if (!membership) return res.status(404).json({ message: 'Member not found' });
    res.json({ membership });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
