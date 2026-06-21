const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Community = require('../models/Community');
const ReportFlag = require('../models/ReportFlag');
const { protect } = require('../middleware/auth');

// GET /api/posts?community_id=x
router.get('/', protect, async (req, res, next) => {
  try {
    const { community_id, page = 1, limit = 20 } = req.query;
    const query = { isHidden: false };
    if (community_id) query.community = community_id;
    const posts = await Post.find(query)
      .populate('author', 'fullName neighbourhood')
      .populate('comments.author', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Post.countDocuments(query);
    res.json({ posts, total });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts
router.post('/', protect, async (req, res, next) => {
  try {
    const { community, text, category, imageUrl } = req.body;
    const post = await Post.create({ community, text, category, imageUrl, author: req.user._id });
    await Community.findByIdAndUpdate(community, { $inc: { postCount: 1 } });
    await post.populate('author', 'fullName neighbourhood');
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/like
router.post('/:id/like', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const liked = post.likes.includes(req.user._id);
    if (liked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json({ likesCount: post.likes.length, liked: !liked });
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id/liked
router.get('/:id/liked', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const liked = post.likes.includes(req.user._id);
    res.json({ liked });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/posts/:id/hide
router.patch('/:id/hide', protect, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { isHidden: true }, { new: true });
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/report
router.post('/:id/report', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await ReportFlag.create({
      reportedBy: req.user._id,
      community: post.community,
      targetType: 'post',
      targetId: post._id,
      reason: req.body.reason,
    });
    res.json({ message: 'Post reported' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
