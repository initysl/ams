const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();

  res.status(401).json({ message: "Not authenticated. You must log in first" });
});

module.exports = authMiddleware;
