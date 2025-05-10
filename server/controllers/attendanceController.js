const mongoose = require("mongoose");
const LectureSession = require("../models/LectureSession");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const { addMinutes, isAfter, formatISO, parseISO } = require("date-fns");
const asyncHandler = require("express-async-handler");
const logger = require("../middlewares/log");

let qrGenerationCount = 0;

// Generate Attendance QR Code
const generateAttendanceQRCode = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. Please log in" });
    }
    if (req.user.role !== "lecturer") {
      return res
        .status(401)
        .json({ error: "Only lecturers can generate QR codes" });
    }

    const { courseCode, courseTitle, level, duration } = req.body;
    if (!courseCode || !courseTitle || !level || !duration) {
      return res.status(400).json({
        error: "courseCode, courseTitle, level, and duration are required",
      });
    }

    const sessionStart = new Date();
    const sessionEnd = addMinutes(sessionStart, duration);

    const lectureSession = new LectureSession({
      courseCode,
      courseTitle,
      level,
      sessionStart,
      sessionEnd,
    });

    await lectureSession.save();

    const sessionId = lectureSession._id.toString();
    const expiryTime = formatISO(sessionEnd);

    const token = jwt.sign(
      { sessionId, courseCode, courseTitle, level, expiryTime },
      process.env.JWT_SECRET,
      { expiresIn: duration * 60 }
    );

    const qrCodeUrl = await QRCode.toDataURL(token);
    qrGenerationCount++;

    if (qrGenerationCount % 5 === 0) {
      logger.info(
        `QR Code generated for session: ${sessionId}, expires at: ${expiryTime}`
      );
    }

    res.status(200).json({
      qrCodeUrl,
      sessionId,
      expiryTime,
      courseDetails: { courseCode, courseTitle, level, duration },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Error generating QR code" });
  }
});

// Mark Attendance
const markAttendance = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "QR Code token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({ error: "QRrrrrrrrrr Code has expired" });
      }
      return res.status(400).json({ error: "Invalid token" });
    }

    const { sessionId, courseCode, courseTitle, level, expiryTime } = decoded;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID format" });
    }

    if (isAfter(new Date(), parseISO(expiryTime))) {
      return res.status(400).json({ error: "QR Code has expired" });
    }

    const student = req.user;
    if (!student) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const { name, matricNumber } = student;

    const lectureSession = await LectureSession.findById(sessionId);
    if (!lectureSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    const alreadyMarked = lectureSession.attendanceRecords.some(
      (record) => record.matricNumber === matricNumber
    );

    if (alreadyMarked) {
      return res.status(400).json({ error: "Attendance already marked" });
    }

    const record = {
      student: student._id,
      name: name.trim(),
      matricNumber: matricNumber.trim().toUpperCase(),
      courseCode: courseCode.trim().toUpperCase(),
      courseTitle: courseTitle.trim(),
      level: level.trim(),
      status: "present",
      date: new Date(),
    };

    lectureSession.attendanceRecords.push(record);
    await lectureSession.save();

    res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Error marking attendance" });
  }
});

// Get Attendance Report
const getAttendanceReport = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role !== "lecturer") {
      return res
        .status(401)
        .json({ error: "Unauthorized. Lecturer access only" });
    }

    const { sessionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID format" });
    }

    const lectureSession = await LectureSession.findById(sessionId);
    if (!lectureSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    const report = lectureSession.attendanceRecords.map((record) => ({
      name: record.name,
      matricNumber: record.matricNumber,
      courseCode: record.courseCode,
      level: record.level,
      status: record.status,
    }));

    logger.info(
      `Attendance report generated for lecture session: ${sessionId}`
    );
    return res.status(200).json({ report });
  } catch (error) {
    console.error("Error generating attendance report:", error);
    res.status(500).json({ error: "Error generating attendance report" });
  }
});

// Recently Marked Attendance
const recentlyMarkedAttendance = asyncHandler(async (req, res) => {
  try {
    const { matricNumber } = req.user;
    if (!matricNumber) {
      return res.status(401).json({ error: "Unauthorized. Please log in" });
    }

    const lectureSessions = await LectureSession.find({
      "attendanceRecords.matricNumber": matricNumber,
    });

    if (!lectureSessions.length) {
      return res.status(404).json({ error: "No recent attendance found" });
    }

    const recentSessions = lectureSessions.map((session) => ({
      sessionId: session._id,
      courseCode: session.courseCode,
      courseTitle: session.courseTitle,
      level: session.level,
      status: session.attendanceRecords.find(
        (record) => record.matricNumber === matricNumber
      )?.status,
      date: session.attendanceRecords.find(
        (record) => record.matricNumber === matricNumber
      )?.date,
    }));

    res.status(200).json(recentSessions);
  } catch (error) {
    console.error("Error fetching recent attendance:", error);
    res.status(500).json({ error: "Error fetching recent attendance" });
  }
});

module.exports = {
  generateAttendanceQRCode,
  markAttendance,
  getAttendanceReport,
  recentlyMarkedAttendance,
};
