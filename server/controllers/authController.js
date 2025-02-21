require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../middlewares/log");
const SECRET_KEY = process.env.JWT_SECRET;
const asyncHandler = require("express-async-handler");

// Registration
const register = asyncHandler(async (req, res) => {
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

  res.status(201).json({
    message: "User registered successfully!",
  });
});

module.exports = { register };

module.exports = { register };
