const express = require("express");
const {
  generateAttendanceQRCode,
  markAttendance,
  getAttendanceReport,
} = require("../controllers/attendanceController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateSessionId } = require("../middlewares/validationMiddleware");
const router = express.Router();

router.post("/generate", authMiddleware, generateAttendanceQRCode);
router.post("/mark", authMiddleware, markAttendance);
router.get(
  "/report/:sessionId",
  authMiddleware,
  validateSessionId,
  getAttendanceReport
);

module.exports = router;
