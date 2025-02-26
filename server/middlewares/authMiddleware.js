const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

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

module.exports = authMiddleware;
