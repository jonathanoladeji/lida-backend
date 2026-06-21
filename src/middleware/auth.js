const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Membership = require('../models/Membership');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.isSuspended) return res.status(403).json({ message: 'Account suspended' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

exports.requireMembership = async (req, res, next) => {
  try {
    const communityId = req.params.communityId || req.body.community;
    const membership = await Membership.findOne({
      user: req.user._id,
      community: communityId,
      status: 'active',
    });
    if (!membership) {
      return res.status(403).json({ message: 'You must be a member of this community' });
    }
    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

exports.requireModerator = async (req, res, next) => {
  try {
    const communityId = req.params.communityId || req.body.community;
    if (req.user.role === 'admin') return next();
    const membership = await Membership.findOne({
      user: req.user._id,
      community: communityId,
      status: 'active',
      role: 'moderator',
    });
    if (!membership) {
      return res.status(403).json({ message: 'Moderator access required' });
    }
    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};
