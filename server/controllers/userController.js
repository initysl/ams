const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const logger = require("../middlewares/log");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { sendVerificationEmail } = require("../utils/sendEmail");
const Feedback = require("../models/Feedback");

// Get User Profile
const UserProfile = asyncHandler(async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ message: errors.array() });
  // }
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        matricNumber: user.matricNumber,
        department: user.department,
        profilePicture: user.profilePicture,
        role: user.role,
        isVerified: user.isVerified,
      },
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
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const updates = { ...req.body };
  let isEmailUpdated = false;
  if (updates.password && updates.password.trim() !== "") {
    const isSamePassword = await bcrypt.compare(
      updates.password,
      user.password
    );
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }
    updates.password = await bcrypt.hash(updates.password, 12);
  } else {
    delete updates.password;
  }
  // Handle profile picture upload with deletion
  if (req.file) {
    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(user.profilePicture)
      );
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error("Failed to delete old profile picture:", err.message);
        }
      });
    }
    updates.profilePicture = `/uploads/${req.file.filename}`;
  }
  // Email update logic
  if (updates.email && updates.email !== user.email) {
    const emailExists = await User.findOne({
      email: updates.email,
      _id: { $ne: req.user._id },
    });
    if (emailExists) {
      return res.status(400).json({ message: "Email exits" });
    }
    updates.pendingEmail = updates.email;
    updates.isVerified = false;
    isEmailUpdated = true;

    const token = jwt.sign(
      { id: req.user._id, newEmail: updates.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    try {
      await sendVerificationEmail(updates.email, token);
      logger.info(`Verification email sent to ${updates.email}`);
    } catch (emailError) {
      logger.error("Failed to send email:", emailError.message);
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }
    delete updates.email;
  }

  // Perform the update
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updatedUser) {
    return res.status(404).json({ message: "User profile not found" });
  }

  if (isEmailUpdated) {
    return res.json({
      message:
        "Verification email sent. Please verify before changes take effect.",
    });
  }
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    department: updatedUser.department,
    matricNumber: updatedUser.matricNumber,
    email: updatedUser.email,
    profilePicture: updatedUser.profilePicture,
    role: updatedUser.role,
    isVerified: updatedUser.isVerified,
  });
  logger.info(`User profile updated: ${updatedUser.email}`);
});

// Delete User Profile
const deleteUserProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User profile not found");
  }
  await User.deleteOne({ _id: req.user._id });
  logger.info(`User account deleted: ${user.email}, ${user.matricNumber}`);
  res.json({ message: "Account deleted successfully" });
});

// User Feedback
const userFeedback = asyncHandler(async (req, res) => {
  try {
    const { category, message, email } = req.body;

    if (!category || !message) {
      return res
        .status(400)
        .json({ message: "Category and message are required" });
    }

    const feedback = new Feedback({
      category,
      message,
      email,
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    logger.error(`User feedback error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = {
  UserProfile,
  updateUserProfile,
  deleteUserProfile,
  userFeedback,
};
