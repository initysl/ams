const express = require("express");
const {
  generateAttendanceQRCode,
  markAttendance,
} = require("../controllers/attendanceController");
const router = express.Router();

// Routes here; Need authMiddleware here as well
router.post("/generate", generateAttendanceQRCode);
router.post("/mark", markAttendance);

module.exports = router;
