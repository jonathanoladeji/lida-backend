const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Issue = require('../models/Issue');
const { protect } = require('../middleware/auth');

// POST /api/comments
router.post('/', protect, async (req, res, next) => {
  try {
    const { post_id, issue_id, text } = req.body;
    if (post_id) {
      const post = await Post.findById(post_id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      post.comments.push({ author: req.user._id, text });
      await post.save();
      await post.populate('comments.author', 'fullName');
      return res.status(201).json({ comment: post.comments[post.comments.length - 1] });
    }
    if (issue_id) {
      const issue = await Issue.findById(issue_id);
      if (!issue) return res.status(404).json({ message: 'Issue not found' });
      issue.comments.push({ author: req.user._id, text });
      await issue.save();
      await issue.populate('comments.author', 'fullName');
      return res.status(201).json({ comment: issue.comments[issue.comments.length - 1] });
    }
    res.status(400).json({ message: 'post_id or issue_id required' });
  } catch (err) {
    next(err);
  }
});

// GET /api/comments/post/:postId
router.get('/post/:postId', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId).populate('comments.author', 'fullName');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ comments: post.comments.filter(c => !c.isHidden) });
  } catch (err) {
    next(err);
  }
});

// GET /api/comments/issue/:issueId
router.get('/issue/:issueId', protect, async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.issueId).populate('comments.author', 'fullName');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ comments: issue.comments.filter(c => !c.isHidden) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/comments/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    // Try post comments first
    const post = await Post.findOne({ 'comments._id': req.params.id });
    if (post) {
      const comment = post.comments.id(req.params.id);
      if (comment) { comment.isHidden = true; await post.save(); }
      return res.json({ message: 'Comment removed' });
    }
    // Try issue comments
    const issue = await Issue.findOne({ 'comments._id': req.params.id });
    if (issue) {
      const comment = issue.comments.id(req.params.id);
      if (comment) { comment.isHidden = true; await issue.save(); }
      return res.json({ message: 'Comment removed' });
    }
    res.status(404).json({ message: 'Comment not found' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
