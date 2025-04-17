require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../middlewares/log");
const { validationResult } = require("express-validator");
const SECRET_KEY = process.env.JWT_SECRET;
const asyncHandler = require("express-async-handler");
const sendVerificationEmail = require("../utils/verifyEmail");
const upload = require("../utils/multerConfig");
// Ensure you store jwt using cookies here

// Registration
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const { name, email, matricNumber, department, password } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { matricNumber }],
  });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // If a profile picture was uploaded, use the filename; else fallback to default
  const profilePicture = req.file
    ? `/uploads/${req.file.filename}` // frontend can access via this path
    : "/images/default.png"; // use your fallback image path

  const newUser = new User({
    name,
    email,
    matricNumber,
    department,
    profilePicture,
    password: hashedPassword,
    role: matricNumber ? "student" : "lecturer",
  });

  await newUser.save();

  const token = jwt.sign({ id: newUser._id }, SECRET_KEY, {
    expiresIn: "1h",
  });

  await sendVerificationEmail(newUser.email, token);

  res.status(201).json({
    message: "User registered successfully! Please verify your email",
  });

  logger.info(`User registered: ${newUser.email}, ${newUser.matricNumber}`);
});

// Login
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  const { email, password, remember } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    return res.status(429).json({
      message: "Too many failed attempts. Please try again later.",
    });
  }

  if (!user.isVerified) {
    return res.status(400).json({
      message: "Please verify your email before logging in.",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    // Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 10 * 60 * 1000; // Lock for 10 minutes
      logger.warn(`User locked out: ${user.email}`);
    }

    await user.save();
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Reset failed attempts on successful login
  Object.assign(user, { loginAttempts: 0, lockUntil: undefined });
  await user.save();

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "5d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: remember ? 5 * 24 * 60 * 60 * 1000 : undefined, // 5 days
  });

  res.status(200).json({
    message: "User logged in successfully",
    user: {
      name: user.name,
      matricNumber: user.matricNumber,
      profilePic: user.profilePicture,
    },
  });

  logger.info(`User logged in: ${user.email}`);
});

// Verify Email Address
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token." });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid verification link." });
  }

  user.isVerified = true;
  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Email verified successfully!" });
});

// Logout; Handle this in frontend using cookies
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res
    .status(200)
    .json({ message: `User logged out successfully: ${req.user.email}` });
  logger.info(`User logged out: ${req.user.email}`);
});

module.exports = { register, login, verifyEmail, logout };
