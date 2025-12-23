const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const logger = require('../middlewares/log');

// Ensure Auth middleware with cookies here as well
const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    logger.error(`🔒 Token verification failed: ${err}`);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
  next();
});

// Fixed login limiter - IPv6 compatible
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit to 5 attempts per IP
  message: {
    message: 'Too many login attempts, try again after five minutes',
  },
  handler: (req, res) => {
    logger.warn(`🚨 Too many login attempts from IP: ${req.ip}`);
    res.status(429).json({
      message: 'Too many login attempts, try again after five minutes',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authMiddleware, loginLimiter };
