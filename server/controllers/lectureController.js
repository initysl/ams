const LectureSession = require("../models/LectureSession");

exports.startLectureSession = async (req, res) => {
  try {
    const { lectureId } = req.body;
    const session = await LectureSession.create({
      lecture: lectureId,
      sessionStart: new Date(),
      attendanceRecords: [],
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: "Error starting lecture session" });
  }
};
