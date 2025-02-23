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
    const { courseCode, description, level, expiryMinutes } = req.body;

    if (!courseCode || !description || !expiryMinutes) {
      return res.status(400).json({
        error: "Course code, description, and expiry time are required",
      });
    }

    // Create a new lecture session
    const lectureSession = new LectureSession({
      courseCode,
      description,
      level,
      sessionStart: new Date(),
      sessionEnd: moment().add(expiryMinutes, "minutes").toDate(),
    });

    await lectureSession.save();

    const sessionId = lectureSession._id.toString();
    const expiryTime = lectureSession.sessionEnd.toISOString();

    // Generate JWT token with session ID
    const token = jwt.sign(
      { sessionId, courseCode, description, level, expiryTime },
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

module.exports = { generateAttendanceQRCode, markAttendance };
