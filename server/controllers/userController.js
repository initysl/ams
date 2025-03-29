const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../middlewares/log");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Get User Profile
const getUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      matricNumber: user.matricNumber,
      department: user.department,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("User profile not found");
  }
});

// Update User Profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const updates = { ...req.body };

  if (updates.password) {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSamePassword = await bcrypt.compare(
      updates.password,
      user.password
    );
    if (isSamePassword) {
      return res
        .status(400)
        .json({
          message: "New password cannot be the same as the old password",
        });
    }

    updates.password = await bcrypt.hash(updates.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (updatedUser) {
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      department: updatedUser.department,
      matricNumber: updatedUser.matricNumber,
      email: updatedUser.email,
      token: jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
        expiresIn: "5d",
      }),
    });

    logger.info(
      `User profile updated: ${updatedUser.email}, ${updatedUser.matricNumber}`
    );
  } else {
    return res.status(404).json({ message: "User profile not found" });
  }
});

// Delete User Profile
const deleteUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User profile not found");
  }

  await User.deleteOne({ _id: req.user._id });
  logger.info(`User profile deleted: ${user.email}, ${user.matricNumber}`);
  res.json({ message: "User profile deleted successfully" });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
