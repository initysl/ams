// Fixed User Schema
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    matricNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    department: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "default.png",
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "lecturer"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Number,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
    lastResetAttemptDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
