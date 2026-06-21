const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');

// GET /api/announcements?community_id=x
router.get('/', protect, async (req, res, next) => {
  try {
    const { community_id } = req.query;
    const query = {};
    if (community_id) query.community = community_id;
    const announcements = await Announcement.find(query)
      .populate('author', 'fullName')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ announcements });
  } catch (err) {
    next(err);
  }
});

// POST /api/announcements
router.post('/', protect, async (req, res, next) => {
  try {
    const { community, title, body } = req.body;
    const announcement = await Announcement.create({
      community, title, body, author: req.user._id, isPinned: true,
    });
    await announcement.populate('author', 'fullName');
    res.status(201).json({ announcement });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/announcements/:id/pin
router.patch('/:id/pin', protect, async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id, { isPinned: req.body.isPinned }, { new: true }
    );
    res.json({ announcement });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
