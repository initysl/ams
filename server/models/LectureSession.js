const mongoose = require("mongoose");

// Subdocument Schema for Individual Student Attendance Record
const attendanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    matricNumber: { type: String, required: true },
    courseCode: { type: String, required: true },
    level: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["present"],
      default: "present",
    },
  },
  { _id: false } // Prevents a separate _id for each attendance record (optional)
);

// Main Schema for a Lecture Session with Grouped Attendance
const lectureSessionSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    sessionStart: { type: Date, required: true },
    sessionEnd: { type: Date },
    attendanceRecords: [attendanceRecordSchema], // Array of students who marked attendance
  },
  { timestamps: true }
);

module.exports = mongoose.model("LectureSession", lectureSessionSchema);
