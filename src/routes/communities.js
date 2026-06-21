const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const Membership = require('../models/Membership');
const { protect, requireModerator } = require('../middleware/auth');

// GET /api/communities
router.get('/', async (req, res, next) => {
  try {
    const { name, state, lga, keyword, page = 1, limit = 20 } = req.query;
    const query = { isSuspended: false };
    if (state) query.state = new RegExp(state, 'i');
    if (lga) query.lga = new RegExp(lga, 'i');
    if (name) query.name = new RegExp(name, 'i');
    if (keyword) query.$or = [
      { name: new RegExp(keyword, 'i') },
      { areaDescription: new RegExp(keyword, 'i') },
    ];
    const communities = await Community.find(query)
      .populate('creator', 'fullName')
      .sort({ memberCount: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Community.countDocuments(query);
    res.json({ communities, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
});

// POST /api/communities
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, state, lga, areaDescription, type, rules, gpsLocation, inviteCode } = req.body;
    const community = await Community.create({
      name, state, lga, areaDescription, type, rules, gpsLocation, inviteCode,
      creator: req.user._id,
    });
    await Membership.create({
      user: req.user._id,
      community: community._id,
      role: 'moderator',
      status: 'active',
    });
    res.status(201).json({ community });
  } catch (err) {
    next(err);
  }
});

// GET /api/communities/:id
router.get('/:id', async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id).populate('creator', 'fullName');
    if (!community) return res.status(404).json({ message: 'Community not found' });
    res.json({ community });
  } catch (err) {
    next(err);
  }
});

// GET /api/communities/:id/members
router.get('/:id/members', protect, async (req, res, next) => {
  try {
    const members = await Membership.find({ community: req.params.id, status: 'active' })
      .populate('user', 'fullName email neighbourhood state lga createdAt');
    res.json({ members });
  } catch (err) {
    next(err);
  }
});

// POST /api/communities/:id/join
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });
    if (community.isSuspended) return res.status(403).json({ message: 'Community is suspended' });
    const existing = await Membership.findOne({ user: req.user._id, community: community._id });
    if (existing) return res.status(400).json({ message: 'Already a member or request pending' });

    let status = 'active';
    if (community.type === 'request-to-join') status = 'pending';
    if (community.type === 'invite-only') {
      if (req.body.inviteCode !== community.inviteCode) {
        return res.status(403).json({ message: 'Invalid invite code' });
      }
    }
    const membership = await Membership.create({
      user: req.user._id, community: community._id, role: 'member', status,
    });
    if (status === 'active') {
      await Community.findByIdAndUpdate(community._id, { $inc: { memberCount: 1 } });
    }
    res.json({ membership, status });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/communities/:id
router.patch('/:id', protect, requireModerator, async (req, res, next) => {
  try {
    const allowed = ['name', 'areaDescription', 'type', 'rules', 'inviteCode', 'gpsLocation'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const community = await Community.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ community });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
