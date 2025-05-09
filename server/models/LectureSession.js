const mongoose = require("mongoose");

// Subdocument Schema for Individual Student Attendance Record
const attendanceRecordSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    matricNumber: { type: String, required: true },
    courseCode: { type: String, required: true },
    level: { type: String },
    status: { type: String, enum: ["PRESENT"], default: "PRESENT" },
  },
  { _id: false } // Prevents a separate _id for each attendance record (optional)
);

// Main Schema for a Lecture Session with Grouped Attendance
const lectureSessionSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true },
    courseTitle: { type: String },
    level: { type: String },
    sessionStart: { type: Date, required: true },
    sessionEnd: { type: Date, required: true },
    attendanceRecords: [attendanceRecordSchema], // Array of students who marked attendance
  },
  { timestamps: true }
);

module.exports = mongoose.model("LectureSession", lectureSessionSchema);
