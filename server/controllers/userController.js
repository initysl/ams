const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../middlewares/log");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { sendVerificationEmail } = require("../utils/sendEmail");

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
      email: user.email,
      matricNumber: user.matricNumber,
      department: user.department,
      profilePic: user.profilePicture,
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

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updates = { ...req.body };
  let isEmailUpdated = false;

  // Validate Password Change
  if (updates.password) {
    const isSamePassword = await bcrypt.compare(
      updates.password,
      user.password
    );
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }
    updates.password = await bcrypt.hash(updates.password, 10);
  }
  // Handle Profile Picture Upload
  if (req.file) {
    updates.profilePicture = "../uploads/${req.file.filename}";
  } else if (!user.profilePicture) {
    updates.profilePicture = "../public/images/default.png";
  }

  // Validate Email Change
  if (updates.email && updates.email !== user.email) {
    const emailExists = await User.findOne({ email: updates.email });
    if (emailExists) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Temporarily store email until verification is done
    updates.pendingEmail = updates.email;
    updates.isVerified = false; // Mark email as unverified
    isEmailUpdated = true;

    // Generate email verification token
    const token = jwt.sign(
      { id: req.user._id, newEmail: updates.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await sendVerificationEmail(updates.email, token);
    logger.info(
      `Verification email sent to ${updates.email} for ${user.matricNumber}`
    );

    delete updates.email; // Prevent direct email update before verification
  }

  // If email is updated, stop further execution and request verification first
  if (isEmailUpdated) {
    return res.json({
      message:
        "Verification email sent. Please verify before changes take effect.",
    });
  }

  // Update User Profile
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
      profilePicture: updatedUser.profilePicture,
      isVerified: updatedUser.isVerified,
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
