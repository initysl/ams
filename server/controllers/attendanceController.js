const mongoose = require("mongoose");
const LectureSession = require("../models/LectureSession");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const moment = require("moment");
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
        .json({ error: "Unauthorized. Only lecturers can generate QR codes" });
    }

    const { courseCode, courseTitle, level, expiryMinutes } = req.body;
    if (!courseCode || !courseTitle || !expiryMinutes) {
      return res.status(400).json({
        error: "Course code, courseTitle, level, and expiry time are required",
      });
    }

    // Create a new lecture session
    const lectureSession = new LectureSession({
      courseCode,
      courseTitle,
      level,
      sessionStart: new Date(),
      sessionEnd: moment().add(expiryMinutes, "minutes").toDate(),
    });

    await lectureSession.save();

    const sessionId = lectureSession._id.toString();
    const expiryTime = lectureSession.sessionEnd.toISOString();

    // Generate JWT token with session ID
    const token = jwt.sign(
      { sessionId, courseCode, courseTitle, level, expiryTime },
      process.env.JWT_SECRET,
      { expiresIn: expiryMinutes * 60 } // Convert minutes to seconds
    );

    // Generate QR Code
    const qrCodeUrl = await QRCode.toDataURL(token);
    qrGenerationCount++;

    if (qrGenerationCount % 5 === 0) {
      logger.info(
        `QR Code generated for session: ${sessionId}, expires at: ${expiryTime}`
      );
    }

    res.status(200).json({ qrCodeUrl, sessionId, expiryTime });
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

    // Verify JWT token from the QR code
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded sessionId:", decoded.sessionId); // Debug purpose

    const { sessionId, expiryTime, courseCode, level } = decoded;

    // Validate sessionId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "Invalid session ID format" });
    }

    // Check if token is expired
    if (moment().isAfter(expiryTime)) {
      return res.status(400).json({ error: "QR Code has expired" });
    }

    const student = req.user;
    if (!student) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const { name, matricNumber } = student;

    // Find lecture session
    const lectureSession = await LectureSession.findById(sessionId);
    if (!lectureSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Check if student already marked attendance
    const alreadyMarked = lectureSession.attendanceRecords.some(
      (record) => record.matricNumber === matricNumber
    );

    if (alreadyMarked) {
      return res.status(400).json({ error: "Attendance already marked" });
    }

    // Add student to attendance list
    lectureSession.attendanceRecords.push({
      student: student._id, // Store student ID for reference
      name,
      matricNumber,
      courseCode,
      level,
      status: "present",
    });

    await lectureSession.save();

    res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Error marking attendance" });
  }
});

// Generate Attedance Report
const getAttendanceReport = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. Please log in" });
    }
    if (req.user.role !== "lecturer") {
      return res.status(401).json({
        error: "Unauthorized. Only lecturers can generate attendance reports",
      });
    }
    const { sessionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      console.log("Requested sessionId:", sessionId); //Debug purpose
      return res.status(400).json({ error: "Invalid session ID format" });
    }
    const lectureSession = await LectureSession.findById(sessionId);
    if (!lectureSession) {
      return res.status(404).json({ error: "Session not found" });
    }
    const { attendanceRecords } = lectureSession;
    const report = attendanceRecords.map((record) => {
      return {
        name: record.name,
        matricNumber: record.matricNumber,
        courseCode: record.courseCode,
        level: record.level,
        status: record.status,
      };
    });
    logger.info(
      `Attendance report generated for lecture session: ${sessionId}`
    );
    return res.status(200).json({ report });
  } catch (error) {
    console.error("Error generating attendance report:", error);
    res.status(500).json({ error: "Error generating attendance report" });
  }
});

// Get Recently Marked Attendance
const recentlyMarkedAttendance = asyncHandler(async (req, res) => {
  try {
    const { matricNumber } = req.user;
    if (!matricNumber) {
      return res.status(401).json({ error: "Unauthorized. Please log in" });
    }
    const lectureSessions = await LectureSession.find({
      "attendanceRecords.matricNumber": matricNumber,
    });
    if (!lectureSessions || lectureSessions.length === 0) {
      return res.status(404).json({ error: "No recent attendance found" });
    }
    const recentSessions = lectureSessions.map((session) => ({
      sessionId: session._id,
      courseCode: session.courseCode,
      courseTitle: session.courseTitle,
      level: session.level,
      status: session.attendanceRecords.find(
        (record) => record.matricNumber === matricNumber
      ).status,
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
