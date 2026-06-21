const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Community = require('../models/Community');
const ReportFlag = require('../models/ReportFlag');
const { protect, requireMembership, requireModerator } = require('../middleware/auth');

// GET /api/posts/community/:communityId
router.get('/community/:communityId', protect, requireMembership, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const posts = await Post.find({ community: req.params.communityId, isHidden: false })
      .populate('author', 'fullName neighbourhood')
      .populate('comments.author', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Post.countDocuments({ community: req.params.communityId, isHidden: false });
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

// POST /api/posts/:id/comments
router.post('/:id/comments', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ author: req.user._id, text: req.body.text });
    await post.save();
    await post.populate('comments.author', 'fullName');
    res.status(201).json({ comment: post.comments[post.comments.length - 1] });
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

// PATCH /api/posts/:id/hide (moderator)
router.patch('/:id/hide', protect, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { isHidden: req.body.isHidden ?? true }, { new: true });
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id/comments/:commentId (moderator)
router.delete('/:id/comments/:commentId', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    comment.isHidden = true;
    await post.save();
    res.json({ message: 'Comment hidden' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
