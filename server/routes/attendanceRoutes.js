const express = require("express");
const {
  generateAttendanceQRCode,
  markAttendance,
} = require("../controllers/attendanceController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

// Routes here; Need authMiddleware here as well
router.post("/generate", authMiddleware, generateAttendanceQRCode);
router.post("/mark", authMiddleware, markAttendance);

module.exports = router;
