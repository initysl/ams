require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../middlewares/log');
const { validationResult } = require('express-validator');
const SECRET_KEY = process.env.JWT_SECRET;
const asyncHandler = require('express-async-handler');
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
} = require('../utils/sendEmail');

const normalizeEmail = (email) => email.toLowerCase().trim();
const buildVerificationToken = (payload, expiresIn = '24h') =>
  jwt.sign(payload, SECRET_KEY, { expiresIn });

// Register - Fixed email sending
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const { name, email, matricNumber, department, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  // Better validation for matricNumber.
  if (matricNumber && matricNumber.trim() === '') {
    return res.status(400).json({ message: 'Matric number cannot be empty' });
  }

  // Check email and matricNumber separately for better error messages.
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  if (matricNumber) {
    const existingMatric = await User.findOne({ matricNumber });
    if (existingMatric) {
      return res.status(400).json({ message: 'Matric number already exists' });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const profilePicture = req.body.profilePicture || null;
  const role =
    matricNumber && matricNumber.trim() !== '' ? 'student' : 'lecturer';

  const newUser = new User({
    name: name.trim(),
    email: normalizedEmail,
    matricNumber: matricNumber ? matricNumber.trim() : undefined,
    department: department.trim(),
    profilePicture,
    password: hashedPassword,
    role,
  });

  try {
    await newUser.save();
  } catch (saveError) {
    if (saveError.code === 11000) {
      const field = Object.keys(saveError.keyPattern)[0];
      return res.status(400).json({
        message: `${
          field === 'email' ? 'Email' : 'Matric number'
        } already exists`,
      });
    }
    throw saveError;
  }

  // Generate verification token
  const token = buildVerificationToken({ id: newUser._id });

  //FIX: Use await and handle the email sending properly
  try {
    // Wait for the email to be sent
    const emailResult = await sendVerificationEmail(
      newUser.email,
      token,
      newUser.name,
    );

    // Log success for debugging
    logger.info(
      `✅ Verification email sent to: ${newUser.email} (Message ID: ${emailResult.messageId})`,
    );

    // Only send success response after email is sent
    res.status(201).json({
      message:
        'Registration successful! Please check your inbox/spam to verify your account.',
    });

    logger.info(
      `User registered: ${newUser.email}, ${newUser.matricNumber || 'lecturer'}`,
    );
  } catch (emailError) {
    // Log the full error for debugging
    logger.error(`❌ Failed to send verification email to ${newUser.email}:`);
    logger.error(`Error message: ${emailError.message}`);
    logger.error(`Error stack: ${emailError.stack}`);

    // User is created but email failed
    res.status(201).json({
      message:
        'User registered successfully but email sending failed. Please contact support.',
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
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const lockTimeRemaining = Math.ceil(
      (user.lockUntil - Date.now()) / (1000 * 60),
    );
    return res.status(429).json({
      message: `Account locked. Try again in ${lockTimeRemaining} minutes.`,
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      code: 'ACCOUNT_NOT_VERIFIED',
      message: 'Account not verified. Request a new verification email.',
      email: user.email,
    });
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
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Reset failed attempts on successful login
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '5d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
    path: '/',
  });

  res.status(200).json({
    message: 'User signed in successfully',
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
      message: 'Verification token is required.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new one.',
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid verification token.',
    });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'User not found.',
    });
  }

  const pendingEmail = decoded.newEmail
    ? normalizeEmail(decoded.newEmail)
    : null;

  if (!pendingEmail && user.isVerified) {
    return res.status(200).json({
      success: true,
      message: 'Email is already verified!',
    });
  }

  if (pendingEmail) {
    if (user.pendingEmail !== pendingEmail) {
      return res.status(400).json({
        success: false,
        message: 'This email change request is no longer valid.',
      });
    }

    const existingUser = await User.findOne({
      email: pendingEmail,
      _id: { $ne: user._id },
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'That email address is already in use.',
      });
    }

    user.email = pendingEmail;
    user.pendingEmail = undefined;
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
    message: 'Email verified successfully! Welcome to our platform.',
  });

  logger.info(`Email verified for user: ${user.email}`);
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({
    $or: [{ email }, { pendingEmail: email }],
  });

  if (!user) {
    return res
      .status(404)
      .json({ message: 'No account found for this email address.' });
  }

  if (user.email === email && user.isVerified) {
    return res.status(400).json({ message: 'This email is already verified.' });
  }

  const tokenPayload =
    user.pendingEmail === email
      ? { id: user._id, newEmail: user.pendingEmail }
      : { id: user._id };

  await sendVerificationEmail(
    email,
    buildVerificationToken(tokenPayload),
    user.name,
  );

  logger.info(`Verification email resent to: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Verification email sent. Please check your inbox/spam.',
  });
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
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  if (!user.isVerified) {
    return res.status(400).json({
      message: 'Please verify your email first by attempting to login.',
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
      24 - (now.getHours() + now.getMinutes() / 60),
    );
    return res.status(429).json({
      message: 'Limit exceeded. Please try again tomorrow.',
      retryAfter: hoursUntilReset,
      nextAttemptTime: new Date(
        today.getTime() + 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  }

  // Increment attempt counter
  user.passwordResetAttempts += 1;
  await user.save();

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '5m' });

  try {
    // Pass the user's name to personalize the email
    await sendResetPasswordEmail(user.email, token, user.name);

    const remainingAttempts = 5 - user.passwordResetAttempts;
    res.status(200).json({
      message: 'Password reset link sent to your email',
      remainingAttempts: remainingAttempts,
      attemptsUsed: user.passwordResetAttempts,
    });

    logger.info(
      `Password reset link sent to: ${user.email} (${user.passwordResetAttempts}/5 attempts used)`,
    );
  } catch (emailError) {
    // Rollback the attempt counter if email fails
    user.passwordResetAttempts -= 1;
    await user.save();

    logger.error(`Failed to send reset email: ${emailError.message}`);
    res.status(500).json({
      message: 'Failed to send reset email. Please try again later.',
    });
  }
});

// Validate Reset Token
const validateResetToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      valid: false,
      code: 'MISSING_TOKEN',
      message: 'Reset token is required.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        valid: false,
        code: 'TOKEN_EXPIRED',
        message: 'Reset link has expired.',
      });
    }
    return res.status(400).json({
      valid: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid reset link.',
    });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({
      valid: false,
      code: 'USER_NOT_FOUND',
      message: 'Invalid email or password.',
    });
  }

  res.status(200).json({
    valid: true,
    message: 'Reset token is valid.',
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
      message: 'Reset token is required.',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Link expired.',
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid link.',
    });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  // FIXED: Check if new password is same as current
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return res.status(400).json({
      success: false,
      message: 'New password cannot be the same as current password.',
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
    message: 'Password reset successfully!',
  });

  logger.info(`Password reset successfully for user: ${user.email}`);
});

// Logout
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  const userEmail = req.user ? req.user.email : 'unknown';

  res.status(200).json({
    message: 'User signed out successfully',
  });

  logger.info(`User signed out: ${userEmail}`);
});

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resendVerificationEmail,
  validateResetToken,
  resetPassword,
  logout,
};
