const express = require("express");
const {
  generateAttendanceQRCode,
  markAttendance,
  getAttendanceReport,
  recentlyMarkedAttendance,
} = require("../controllers/attendanceController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateSessionId } = require("../middlewares/validationMiddleware");
const router = express.Router();

router.post("/generate", generateAttendanceQRCode);
router.post("/mark", authMiddleware, markAttendance);
router.get(
  "/report/:sessionId",
  authMiddleware,
  validateSessionId,
  getAttendanceReport
);
router.get("/recent-attendance", authMiddleware, recentlyMarkedAttendance);

module.exports = router;
