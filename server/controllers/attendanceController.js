const LectureSession = require("../models/LectureSession");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const moment = require("moment");
const asyncHandler = require("express-async-handler");

// Generate Attendance QR Code
const generateAttendanceQRCode = asyncHandler(async (req, res) => {
  try {
    const { sessionId, expiryMinutes } = req.body;

    if (!sessionId || !expiryMinutes) {
      return res
        .status(400)
        .json({ error: "Session ID and expiry time are required" });
    }

    // Set expiry time
    const expiryTime = moment().add(expiryMinutes, "minutes").toISOString();

    // Generate JWT token with session ID and expiry time
    const token = jwt.sign({ sessionId, expiryTime }, process.env.JWT_SECRET, {
      expiresIn: expiryMinutes * 60, // Convert minutes to seconds
    });

    // Generate QR Code
    const qrCodeUrl = await QRCode.toDataURL(token);

    res.status(200).json({ qrCodeUrl, expiryTime });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Error generating QR code" });
  }
});

// Mark Attendance
const markAttendance = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body; // Student scans QR code and sends token
    if (!token) {
      return res.status(400).json({ error: "QR Code token is required" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { sessionId, expiryTime } = decoded;

    // Check if token is expired
    if (moment().isAfter(expiryTime)) {
      return res.status(400).json({ error: "QR Code has expired" });
    }

    const { name, matricNumber, courseCode, level } = req.body;

    // Validate required fields
    if (!name || !matricNumber || !courseCode || !level) {
      return res.status(400).json({ error: "All fields are required" });
    }

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
