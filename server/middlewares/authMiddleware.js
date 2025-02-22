const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

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

  req.user = jwt.verify(token, process.env.JWT_SECRET);

  next();
});

module.exports = authMiddleware;
