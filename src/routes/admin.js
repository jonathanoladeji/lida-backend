const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Community = require('../models/Community');
const Post = require('../models/Post');
const Issue = require('../models/Issue');
const { Poll } = require('../models/Poll');
const ReportFlag = require('../models/ReportFlag');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [users, communities, posts, issues, polls, flags] = await Promise.all([
      User.countDocuments(),
      Community.countDocuments(),
      Post.countDocuments(),
      Issue.countDocuments(),
      Poll.countDocuments(),
      ReportFlag.countDocuments({ status: 'pending' }),
    ]);
    res.json({ users, communities, posts, issues, polls, pendingFlags: flags });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 30, search } = req.query;
    const query = search
      ? { $or: [{ fullName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
      : {};
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/suspend
router.patch('/users/:id/suspend', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true, suspendedReason: req.body.reason },
      { new: true }
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/unsuspend
router.patch('/users/:id/unsuspend', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false, suspendedReason: null },
      { new: true }
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/communities
router.get('/communities', async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const communities = await Community.find()
      .populate('creator', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Community.countDocuments();
    res.json({ communities, total });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/communities/:id/suspend
router.patch('/communities/:id/suspend', async (req, res, next) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true, suspendedReason: req.body.reason },
      { new: true }
    );
    res.json({ community });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/communities/:id/unsuspend
router.patch('/communities/:id/unsuspend', async (req, res, next) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false, suspendedReason: null },
      { new: true }
    );
    res.json({ community });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/flags
router.get('/flags', async (req, res, next) => {
  try {
    const flags = await ReportFlag.find({ status: 'pending' })
      .populate('reportedBy', 'fullName email')
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ flags });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/flags/:id
router.patch('/flags/:id', async (req, res, next) => {
  try {
    const flag = await ReportFlag.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, reviewedBy: req.user._id },
      { new: true }
    );
    res.json({ flag });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
