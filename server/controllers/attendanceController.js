const LectureSession = require("../models/LectureSession");

exports.markAttendance = async (req, res) => {
  try {
    const { sessionId, studentId, name, matricNumber, courseCode, level } =
      req.body;
    await LectureSession.findByIdAndUpdate(sessionId, {
      $push: {
        attendanceRecords: {
          student: studentId,
          name,
          matricNumber,
          courseCode,
          level,
          status: "present",
        },
      },
    });
    res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error marking attendance" });
  }
};
