const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const {
      full_name, fullName,
      email, password,
      phone_number, phoneNumber,
      state, lga,
      community_name, neighbourhood,
      address_description, addressDescription,
      agreed_to_rules, agreedToRules,
    } = req.body;

    const resolvedAgreed = agreed_to_rules || agreedToRules;
    if (!resolvedAgreed) {
      return res.status(400).json({ message: 'You must agree to community rules to register' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      fullName: full_name || fullName,
      email,
      password,
      phoneNumber: phone_number || phoneNumber,
      state,
      lga,
      neighbourhood: community_name || neighbourhood,
      addressDescription: address_description || addressDescription,
      agreedToRules: resolvedAgreed,
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isSuspended) return res.status(403).json({ message: `Account suspended: ${user.suspendedReason}` });
    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// POST /api/auth/google/session - not supported
router.post('/google/session', (req, res) => {
  res.status(400).json({ message: 'Google login is not supported. Please use email and password.' });
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/auth/me
router.patch('/me', protect, async (req, res, next) => {
  try {
    const allowed = ['fullName', 'phoneNumber', 'state', 'lga', 'neighbourhood', 'addressDescription', 'avatar'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
