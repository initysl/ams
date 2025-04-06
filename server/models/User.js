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
      sparse: true, // Ensures only students have this field (lecturers can have null)
    },
    department: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "default.jpg", // Default profile picture
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "lecturer"], // Roles can be expanded
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    pendingEmail: {
      type: String,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
