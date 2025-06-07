const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../middlewares/log");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { sendVerificationEmail } = require("../utils/sendEmail");
const Feedback = require("../models/Feedback");

// Get User Profile
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Find user by ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        matricNumber: user.matricNumber,
        department: user.department,
        profilePic: user.profilePicture,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    logger.error(`Get user profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update User Profile
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updates = { ...req.body };
    let isEmailChanged = false;

    // Handle Password Change
    if (updates.password) {
      // Check if new password is same as old password
      const isSamePassword = await bcrypt.compare(
        updates.password,
        user.password
      );
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: "New password cannot be the same as the current password",
        });
      }
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    // Handle Profile Picture Upload
    if (req.file) {
      updates.profilePicture = `../uploads/${req.file.filename}`;
    } else if (!user.profilePicture) {
      updates.profilePicture = "../public/images/default.png";
    }

    // Handle Email Change
    if (updates.email && updates.email !== user.email) {
      // Check if email already exists
      const emailExists = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user._id }, // Exclude current user
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another user",
        });
      }

      // Store pending email and mark as unverified
      updates.pendingEmail = updates.email;
      updates.isVerified = false;
      isEmailChanged = true;

      // Generate email verification token
      const verificationToken = jwt.sign(
        {
          userId: req.user._id,
          newEmail: updates.email,
          type: "email_verification",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Send verification email
      try {
        await sendVerificationEmail(updates.email, verificationToken);
        logger.info(
          `Verification email sent to ${updates.email} for user ${user.matricNumber}`
        );
      } catch (emailError) {
        logger.error(
          `Failed to send verification email: ${emailError.message}`
        );
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please try again.",
        });
      }

      // Remove email from updates to prevent direct update
      delete updates.email;
    }

    // If email was changed, only update pending email and return early
    if (isEmailChanged) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          pendingEmail: updates.pendingEmail,
          isVerified: false,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Verification email sent to your new email address. Please verify to complete the email change.",
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email, // Keep old email until verified
          pendingEmail: updatedUser.pendingEmail,
          matricNumber: updatedUser.matricNumber,
          department: updatedUser.department,
          profilePicture: updatedUser.profilePicture,
          isVerified: updatedUser.isVerified,
        },
      });
    }

    // Update user profile with other changes
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        matricNumber: updatedUser.matricNumber,
        department: updatedUser.department,
        profilePicture: updatedUser.profilePicture,
        isVerified: updatedUser.isVerified,
      },
    });

    logger.info(
      `User profile updated: ${updatedUser.email}, ${updatedUser.matricNumber}`
    );
  } catch (error) {
    logger.error(`Update user profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete User Profile
const deleteUserProfile = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    await User.deleteOne({ _id: req.user._id });

    logger.info(`User profile deleted: ${user.email}, ${user.matricNumber}`);

    res.status(200).json({
      success: true,
      message: "User profile deleted successfully",
    });
  } catch (error) {
    logger.error(`Delete user profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// User Feedback
const userFeedback = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { category, message, email } = req.body;

    if (!category || !message) {
      return res.status(400).json({
        success: false,
        message: "Category and message are required",
      });
    }

    const feedback = new Feedback({
      category,
      message,
      email: email || (req.user ? req.user.email : null),
      userId: req.user ? req.user._id : null,
    });

    await feedback.save();

    logger.info(
      `Feedback submitted: Category - ${category}, Email - ${
        email || "Anonymous"
      }`
    );

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: {
        category: feedback.category,
        submittedAt: feedback.createdAt,
      },
    });
  } catch (error) {
    logger.error(`User feedback error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  userFeedback,
};
