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

  const token = jwt.sign({ id: newUser._id }, SECRET_KEY, {
    expiresIn: "1h",
  });

  res.status(201).json({
    message: "User registered successfully!",
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      matricNumber: newUser.matricNumber,
      department: newUser.department,
      role: newUser.role,
    },
  });
});

module.exports = { register };
