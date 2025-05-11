const express = require("express");
const {
  generateAttendanceQRCode,
  markAttendance,
  getAttendanceReport,
  recentlyMarkedAttendance,
  getLectureSessions,
} = require("../controllers/attendanceController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateSessionId } = require("../middlewares/validationMiddleware");
const router = express.Router();

router.post("/generate", authMiddleware, generateAttendanceQRCode);
router.post("/mark", authMiddleware, markAttendance);
router.get("/lecture", authMiddleware, getLectureSessions);
router.get(
  "/report/:sessionId",
  authMiddleware,
  validateSessionId,
  getAttendanceReport
);
router.get("/record", authMiddleware, recentlyMarkedAttendance);

module.exports = router;
