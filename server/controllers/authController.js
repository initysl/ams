require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../middlewares/log");
const { validationResult } = require("express-validator");
const SECRET_KEY = process.env.JWT_SECRET;
const asyncHandler = require("express-async-handler");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
} = require("../utils/sendEmail");

// Register - Updated with better validation and error handling
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const { name, email, matricNumber, department, password } = req.body;

  // Better validation for matricNumber.
  if (matricNumber && matricNumber.trim() === "") {
    return res.status(400).json({ message: "Matric number cannot be empty" });
  }

  // Check email and matricNumber separately for better error messages.
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ message: "Email already exists" });
  }

  if (matricNumber) {
    const existingMatric = await User.findOne({ matricNumber });
    if (existingMatric) {
      return res.status(400).json({ message: "Matric number already exists" });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // CORRECTED: Use the profilePicture URL from req.body, which was
  // set by the previous middleware after the Cloudinary upload.
  const profilePicture = req.body.profilePicture || "/api/images/default.png";

  const role =
    matricNumber && matricNumber.trim() !== "" ? "student" : "lecturer";

  const newUser = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    matricNumber: matricNumber ? matricNumber.trim() : undefined,
    department: department.trim(),
    profilePicture, // This will now correctly be the Cloudinary URL or the default.
    password: hashedPassword,
    role,
  });

  try {
    await newUser.save();
  } catch (saveError) {
    // Handle duplicate key errors that might slip through.
    if (saveError.code === 11000) {
      const field = Object.keys(saveError.keyPattern)[0];
      return res.status(400).json({
        message: `${
          field === "email" ? "Email" : "Matric number"
        } already exists`,
      });
    }
    throw saveError;
  }

  const token = jwt.sign({ id: newUser._id }, SECRET_KEY, {
    expiresIn: "24h",
  });

  try {
    // Pass the user's name as the third parameter.
    await sendVerificationEmail(newUser.email, token, newUser.name);

    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account.",
    });

    logger.info(
      `User registered: ${newUser.email}, ${newUser.matricNumber || "lecturer"}`
    );
  } catch (emailError) {
    // Handle email sending failure.
    logger.error(`Failed to send verification email: ${emailError.message}`);
    // User is created but email failed - still return success but with a different message.
    res.status(201).json({
      message:
        "User registered successfully! Please contact support for email verification.",
    });
  }
});

// Login - Updated with better verification email handling
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const { email, password } = req.body;

  // FIXED: Normalize email for lookup
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const lockTimeRemaining = Math.ceil(
      (user.lockUntil - Date.now()) / (1000 * 60)
    );
    return res.status(429).json({
      message: `Account locked. Try again in ${lockTimeRemaining} minutes.`,
    });
  }

  if (!user.isVerified) {
    const token = jwt.sign({ id: user._id }, SECRET_KEY, {
      expiresIn: "24h",
    });

    try {
      // Pass the user's name to personalize the email
      await sendVerificationEmail(user.email, token, user.name);
      return res.status(400).json({
        message:
          "Account not verified. A new verification email has been sent to your email address.",
      });
    } catch (emailError) {
      logger.error(`Failed to send verification email: ${emailError.message}`);
      return res.status(400).json({
        message:
          "Please verify your email before logging in. Contact support if needed.",
      });
    }
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    // Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 5 * 60 * 1000; // Lock for 5 minutes
      logger.warn(`User locked out: ${user.email}`);
    }

    await user.save();
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Reset failed attempts on successful login
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "5d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
    path: "/",
  });

  res.status(200).json({
    message: "User signed in successfully",
    user: {
      _id: user._id,
      name: user.name,
      matricNumber: user.matricNumber,
      email: user.email,
      department: user.department,
      profilePicture: user.profilePicture,
      role: user.role,
    },
  });

  logger.info(`User signed in: ${user.email}`);
});

// Verify Email Address - Updated with welcome email option
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Verification token is required.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired. Please request a new one.",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Invalid verification token.",
    });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found.",
    });
  }

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: "Email is already verified!",
    });
  }

  user.isVerified = true;
  await user.save();

  // Optional: Send welcome email after successful verification
  try {
    await sendWelcomeEmail(user.email, user.name);
    logger.info(`Welcome email sent to: ${user.email}`);
  } catch (emailError) {
    // Don't fail the verification if welcome email fails
    logger.error(`Failed to send welcome email: ${emailError.message}`);
  }

  res.status(200).json({
    success: true,
    message: "Email verified successfully! Welcome to our platform.",
  });

  logger.info(`Email verified for user: ${user.email}`);
});

// Forgot Password - Updated with rate limiting and better error handling
const forgotPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }

  if (!user.isVerified) {
    return res.status(400).json({
      message: "Please verify your email first by attempting to login.",
    });
  }

  // Check rate limiting
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Initialize reset attempts if not exists or if it's a new day
  if (
    !user.passwordResetAttempts ||
    !user.lastResetAttemptDate ||
    user.lastResetAttemptDate < today
  ) {
    user.passwordResetAttempts = 0;
    user.lastResetAttemptDate = today;
  }

  // Check if user has exceeded daily limit
  if (user.passwordResetAttempts >= 5) {
    const hoursUntilReset = Math.ceil(
      24 - (now.getHours() + now.getMinutes() / 60)
    );
    return res.status(429).json({
      message: "Limit exceeded. Please try again tomorrow.",
      retryAfter: hoursUntilReset,
      nextAttemptTime: new Date(
        today.getTime() + 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  // Increment attempt counter
  user.passwordResetAttempts += 1;
  await user.save();

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "5m" });

  try {
    // Pass the user's name to personalize the email
    await sendResetPasswordEmail(user.email, token, user.name);

    const remainingAttempts = 5 - user.passwordResetAttempts;
    res.status(200).json({
      message: "Password reset link sent to your email",
      remainingAttempts: remainingAttempts,
      attemptsUsed: user.passwordResetAttempts,
    });

    logger.info(
      `Password reset link sent to: ${user.email} (${user.passwordResetAttempts}/5 attempts used)`
    );
  } catch (emailError) {
    // Rollback the attempt counter if email fails
    user.passwordResetAttempts -= 1;
    await user.save();

    logger.error(`Failed to send reset email: ${emailError.message}`);
    res.status(500).json({
      message: "Failed to send reset email. Please try again later.",
    });
  }
});

// Validate Reset Token
const validateResetToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      valid: false,
      code: "MISSING_TOKEN",
      message: "Reset token is required.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        valid: false,
        code: "TOKEN_EXPIRED",
        message: "Reset link has expired.",
      });
    }
    return res.status(400).json({
      valid: false,
      code: "INVALID_TOKEN",
      message: "Invalid reset link.",
    });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({
      valid: false,
      code: "USER_NOT_FOUND",
      message: "User does not exist.",
    });
  }

  res.status(200).json({
    valid: true,
    message: "Reset token is valid.",
  });
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const { token, newPassword, confirmPassword } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Reset token is required.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Link expired.",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Invalid link.",
    });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User does not exist.",
    });
  }

  // FIXED: Check if new password is same as current
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return res.status(400).json({
      success: false,
      message: "New password cannot be the same as current password.",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;

  // FIXED: Reset login attempts when password is reset
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully!",
  });

  logger.info(`Password reset successfully for user: ${user.email}`);
});

// Logout
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  const userEmail = req.user ? req.user.email : "unknown";

  res.status(200).json({
    message: "User signed out successfully",
  });

  logger.info(`User signed out: ${userEmail}`);
});

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  logout,
};
