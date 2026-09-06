const mongoose = require("mongoose");
const LectureSession = require("../models/LectureSession");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const { addMinutes, isAfter, formatISO, parseISO } = require("date-fns");
const asyncHandler = require("express-async-handler");
const logger = require("../middlewares/log");

let qrGenerationCount = 0;
const normalizeMatricNumber = (value = "") => value.trim().toUpperCase();

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

    const { courseTitle, totalCourseStudents, courseCode, level, duration } =
      req.body;
    const parsedDuration = Number(duration);
    const parsedTotalStudents = Number(totalCourseStudents);

    if (!courseCode || !courseTitle || !level || !parsedDuration) {
      return res.status(400).json({
        error:
          "courseTitle, totalCourseStudents, courseCode, level, and duration are required",
      });
    }
    if (!Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 60) {
      return res.status(400).json({ error: "Duration must be between 1 and 60 minutes" });
    }
    if (!Number.isInteger(parsedTotalStudents) || parsedTotalStudents < 1) {
      return res.status(400).json({ error: "Total course students must be a positive number" });
    }

    const sessionStart = new Date();
    const sessionEnd = addMinutes(sessionStart, parsedDuration);

    const lectureSession = new LectureSession({
      courseTitle,
      totalCourseStudents: parsedTotalStudents,
      courseCode,
      level,
      sessionStart,
      sessionEnd,
      lecturer: req.user._id,
      active: true, // Add active flag to track if session is active
    });

    await lectureSession.save();

    const sessionId = lectureSession._id.toString();
    const expiryTime = formatISO(sessionEnd);

    const token = jwt.sign(
      {
        sessionId,
        courseTitle,
        totalCourseStudents: parsedTotalStudents,
        courseCode,
        level,
        expiryTime,
      },
      process.env.JWT_SECRET,
      { expiresIn: parsedDuration * 60 }
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
      courseDetails: {
        courseCode,
        totalCourseStudents: parsedTotalStudents,
        courseTitle,
        level,
        duration: parsedDuration,
      },
    });
  } catch (error) {
    // console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Error generating QR code" });
  }
});

// Stop Lecture Session
const stopLectureSession = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. Please log in" });
    }

    if (req.user.role !== "lecturer") {
      return res
        .status(401)
        .json({ error: "Only lecturers can manage sessions" });
    }

    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const lectureSession = await LectureSession.findById(sessionId);

    if (!lectureSession) {
      return res.status(404).json({ error: "Lecture session not found" });
    }
    if (lectureSession.lecturer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only manage your own sessions" });
    }
    if (!lectureSession.active) {
      return res.status(400).json({ error: "Session has already been stopped" });
    }
    lectureSession.active = false;
    lectureSession.sessionEnd = new Date(); // End the session now rather than at original end time
    await lectureSession.save();

    res.status(200).json({
      message: "Session stopped successfully",
      sessionId: lectureSession._id,
    });
  } catch (error) {
    // console.error("Error stopping lecture session:", error);
    res.status(500).json({ error: "Error stopping lecture session" });
  }
});

// Delete Lecture Session
const deleteLectureSession = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. Please log in" });
    }
    if (req.user.role !== "lecturer") {
      return res
        .status(401)
        .json({ error: "Only lecturers can delete sessions" });
    }

    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const lectureSession = await LectureSession.findById(sessionId);

    if (!lectureSession) {
      return res.status(404).json({ error: "Lecture session not found" });
    }
    if (lectureSession.lecturer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own sessions" });
    }

    await LectureSession.findByIdAndDelete(sessionId);

    res.status(200).json({
      message: "Session deleted successfully",
    });
  } catch (error) {
    // console.error("Error deleting lecture session:", error);
    res.status(500).json({ error: "Error deleting lecture session" });
  }
});

// Mark Attendance
const markAttendance = asyncHandler(async (req, res) => {
  try {
    const { token, confirmAttendance } = req.body;

    if (!token) {
      return res.status(400).json({ error: "QR Code token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({ error: "QR Code expired" });
      }
      return res.status(400).json({ error: "Invalid QR Code" });
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
    if (student.role !== "student") {
      return res.status(403).json({ error: "Only students can mark attendance" });
    }

    const lectureSession = await LectureSession.findById(sessionId);
    if (!lectureSession) {
      return res.status(404).json({ error: "Session not found" });
    }
    if (!lectureSession.active) {
      return res.status(400).json({ error: "Lecture session has been stopped" });
    }
    if (new Date() > new Date(lectureSession.sessionEnd)) {
      lectureSession.active = false;
      await lectureSession.save();
      return res.status(400).json({ error: "Lecture session has ended" });
    }

    const { name, matricNumber } = student;
    const normalizedMatricNumber = normalizeMatricNumber(matricNumber);

    const alreadyMarked = lectureSession.attendanceRecords.some(
      (record) => normalizeMatricNumber(record.matricNumber) === normalizedMatricNumber
    );

    if (alreadyMarked) {
      return res.status(400).json({ error: "Attendance already marked" });
    }

    const now = new Date();
    const expiry = parseISO(expiryTime);
    const durationInMinutes = Math.max(
      0,
      Math.floor((expiry - now) / (1000 * 60))
    );

    // If confirmAttendance is not provided, return course data for confirmation
    if (!confirmAttendance) {
      return res.status(200).json({
        success: true,
        requiresConfirmation: true,
        courseData: {
          courseCode: courseCode.trim().toUpperCase(),
            courseTitle: courseTitle.trim(),
          level: level.trim(),
          duration: `${durationInMinutes} minutes remaining`,
          sessionTime:
            lectureSession.sessionStart.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
        },
      });
    }

    // If confirmAttendance is true, mark the attendance
    const record = {
      student: student._id,
      name: name.trim(),
      matricNumber: normalizedMatricNumber,
      courseCode: courseCode.trim().toUpperCase(),
      courseTitle: courseTitle.trim(),
      level: level.trim(),
      status: "present",
      date: new Date(),
    };

    lectureSession.attendanceRecords.push(record);
    await lectureSession.save();

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      courseData: {
        courseCode: courseCode.trim().toUpperCase(),
        courseTitle: courseTitle.trim(),
        level: level.trim(),
      },
    });
  } catch (error) {
    // console.error("Error marking attendance:", error);
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
    if (lectureSession.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only view your own session reports" });
    }

    const report = lectureSession.attendanceRecords.map((record) => ({
      name: record.name,
      matricNumber: record.matricNumber,
      courseCode: record.courseCode,
      level: record.level,
      status: record.status,
    }));

    // Calculate correct attendance rate
    const presentCount = report.filter(
      (r) => r.status.toLowerCase() === "present"
    ).length;

    const totalCourseStudents = Number(lectureSession.totalCourseStudents) || 0;
    const attendanceRate =
      totalCourseStudents > 0
        ? Math.round((presentCount / totalCourseStudents) * 100)
        : 0;

    logger.info(
      `Attendance report generated for lecture session: ${sessionId}`
    );

    // Return both report and session data
    return res.status(200).json({
      report,
      sessionData: {
        totalCourseStudents,
        attendanceRate,
        courseCode: lectureSession.courseCode,
        courseTitle: lectureSession.courseTitle,
        level: lectureSession.level,
        sessionStart: lectureSession.sessionStart,
        sessionEnd: lectureSession.sessionEnd,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error generating attendance report" });
  }
});

// Get Lecture Sessions
const getLectureSessions = asyncHandler(async (req, res) => {
  try {
    // Check if user is a lecturer
    if (req.user.role !== "lecturer") {
      return res
        .status(401)
        .json({ error: "Unauthorized. Lecturer access only" });
    }

    // Get all lecture sessions created by this lecturer
    const lectureSessions = await LectureSession.find({
      lecturer: req.user._id,
    }).sort({ createdAt: -1 }); // Sort by creation date, newest first

    // For debugging
    // console.log(
    //   `Found ${lectureSessions.length} lecture sessions for lecturer ID: ${req.user._id}`
    // );

    // Format the data to match frontend expectations
    const formattedSessions = lectureSessions.map((session) => ({
      _id: session._id,
      courseCode: session.courseCode,
      courseTitle: session.courseTitle || "Untitled Course",
      date: session.sessionStart, // Using sessionStart as date for the frontend
    }));

    // Return the sessions - send array directly as expected by frontend
    res.status(200).json(formattedSessions);
  } catch (error) {
    // console.error("Error fetching lecture sessions:", error);
    res.status(500).json({ error: "Error fetching lecture sessions" });
  }
});

// Recently Marked Attendance
const recentlyMarkedAttendance = asyncHandler(async (req, res) => {
  try {
    const matricNumber = normalizeMatricNumber(req.user.matricNumber);
    if (!matricNumber) {
      return res.status(401).json({ error: "Unauthorized. Please log in" });
    }

    // Find all lecture sessions where this student has marked attendance
    const lectureSessions = await LectureSession.find({
      "attendanceRecords.matricNumber": matricNumber,
    });

    if (!lectureSessions.length) {
      return res.status(404).json({ error: "No recent attendance found" });
    }

    // Map the sessions to the format we want to return
    const recentSessions = lectureSessions.map((session) => {
      const studentRecord = session.attendanceRecords.find(
        (record) => normalizeMatricNumber(record.matricNumber) === matricNumber
      );

      return {
        sessionId: session._id,
        courseCode: session.courseCode,
        courseTitle: session.courseTitle,
        level: session.level,
        status: studentRecord?.status,
        date: studentRecord?.date || session.sessionStart,
        exactDate: studentRecord ? new Date(studentRecord.date) : null,
      };
    });

    // Sort by date (most recent first)
    recentSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(recentSessions);
  } catch (error) {
    // console.error("Error fetching recent attendance:", error);
    res.status(500).json({ error: "Error fetching recent attendance" });
  }
});

// Attendance Trend
const attendanceTrend = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role !== "lecturer") {
      return res
        .status(401)
        .json({ error: "Unauthorized. Lecturer access only" });
    }

    // Fetch all sessions by this lecturer
    const sessions = await LectureSession.find({ lecturer: req.user._id });

    const trendData = sessions.map((session) => ({
      courseCode: session.courseCode,
      sessionDate: session.sessionStart.toISOString().split("T")[0], // Keep for backward compatibility
      sessionDateTime: session.sessionStart.toISOString(), // Full datetime for accurate relative time
      attendanceCount: session.attendanceRecords.length,
      totalCourseStudents: session.totalCourseStudents || 0,
      attendanceRate:
        Number(session.totalCourseStudents) > 0
          ? Math.round(
              (session.attendanceRecords.length /
                Number(session.totalCourseStudents)) *
                100
            )
          : 0,
    }));

    // Optional: sort by course and date
    trendData.sort(
      (a, b) => new Date(a.sessionDateTime) - new Date(b.sessionDateTime)
    );

    res.status(200).json(trendData);
  } catch (error) {
    // console.error("Error generating attendance trend:", error);
    res.status(500).json({ error: "Error generating attendance trend" });
  }
});

module.exports = {
  generateAttendanceQRCode,
  stopLectureSession,
  deleteLectureSession,
  markAttendance,
  getAttendanceReport,
  getLectureSessions,
  recentlyMarkedAttendance,
  attendanceTrend,
};
