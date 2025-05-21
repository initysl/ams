const mongoose = require("mongoose");

// Subdocument Schema for Individual Student Attendance Record
const attendanceRecordSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    matricNumber: { type: String, required: true },
    courseCode: { type: String, required: true },
    level: { type: String },
    status: { type: String, default: "present" },
    date: { type: Date, required: true },
  },
  { _id: false } // Prevents a separate _id for each attendance record (optional)
);

// Main Schema for a Lecture Session with Grouped Attendance
const lectureSessionSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true },
    courseCode: { type: String, required: true },
    level: {
      type: String,
      required: true,
      enum: ["100", "200", "300", "400", "500"],
    },
    sessionStart: { type: Date, required: true },
    sessionEnd: { type: Date, required: true },
    attendanceRecords: [attendanceRecordSchema], // Array of students who marked attendance
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LectureSession", lectureSessionSchema);
