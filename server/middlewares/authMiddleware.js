const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const rateLimit = require("express-rate-limit");
const logger = require("../middlewares/log");

// Ensure Auth middleware with cookies here as well
const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");
  // Optional chaining ?. is used to avoid errors if authHeader is null
  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Authorization token missing or invalid format" });
    return;
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select("-password");
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit to 3 attempts per IP
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"] || req.ip; // Works with proxies
  },
  message: {
    message: "Too many login attempts, please try again after 15 minutes",
  },
  handler: (req, res) => {
    logger.warn(`🚨 Too many login attempts from IP: ${req.ip}`);
    res.status(429).json({
      message: "Too many login attempts, please try again after 15 minutes",
    });
  },
  standardHeaders: true, // Return rate limit headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

module.exports = { authMiddleware, loginLimiter };
