const express = require("express");
const {
  generateAttendanceQRCode,
  stopLectureSession,
  deleteLectureSession,
  markAttendance,
  getAttendanceReport,
  recentlyMarkedAttendance,
  getLectureSessions,
  attendanceTrend,
} = require("../controllers/attendanceController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { validateSessionId } = require("../middlewares/validationMiddleware");
const router = express.Router();

router.post("/generate", authMiddleware, generateAttendanceQRCode);
router.post("/stop/:sessionId", authMiddleware, stopLectureSession);
router.delete("/session/:sessionId", authMiddleware, deleteLectureSession);
router.post("/mark", authMiddleware, markAttendance);
router.get("/lecture", authMiddleware, getLectureSessions);
router.get(
  "/report/:sessionId",
  authMiddleware,
  validateSessionId,
  getAttendanceReport
);
router.get("/record", authMiddleware, recentlyMarkedAttendance);
router.get("/trend", authMiddleware, attendanceTrend);

module.exports = router;
