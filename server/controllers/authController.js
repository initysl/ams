require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../middlewares/log");
const { validationResult } = require("express-validator");
const SECRET_KEY = process.env.JWT_SECRET;
const asyncHandler = require("express-async-handler");

// Registration
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  const { name, email, matricNumber, password, department } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { matricNumber }],
  });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    matricNumber,
    department,
    password: hashedPassword,
    role: matricNumber ? "student" : "lecturer",
  });

  await newUser.save();

  const token = jwt.sign({ id: newUser._id }, SECRET_KEY, {
    expiresIn: "1h",
  });

  res.status(201).json({
    message: "User registered successfully!",
    token,
  });
  logger.info(`User registered: ${newUser.email}, ${newUser.matricNumber}`);
});

// Login
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id }, SECRET_KEY, {
    expiresIn: "5d",
  });
  res.status(200).json({
    message: "User logged in successfully",
    token,
    user: {
      name: user.name,
      matricNumber: user.matricNumber,
    },
  });
  logger.info(`User logged in: ${user.email}`);
});

// Verify Email Address
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const decoded = jwt.verify(token, SECRET_KEY);

  let user = await User.findById(decoded.id);
  if (!user) {
    return res.status(400).json({ message: "Invalid verification link." });
  }
  // Update user's verification status
  user.isVerified = true;
  await user.save();
  res
    .status(200)
    .json({ message: "Email verfication successfully! Proceed to login" });
});

// Logout
const logout = asyncHandler(async (req, res) => {
  // Remove or clearCookie
});

module.exports = { register, login, verifyEmail, logout };
