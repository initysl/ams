const LectureSession = require("../models/LectureSession");

exports.startLectureSession = async (req, res) => {
  try {
    const { lectureId } = req.body;
    
    if (!lectureId) {
      return res.status(400).json({ error: "Lecture ID is required" });
    }

    const session = await LectureSession.create({
      lecture: lectureId,
      sessionStart: new Date(),
      attendanceRecords: [],
      status: 'active'
    });
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Lecture session creation error:', error);
    res.status(500).json({ 
      error: "Failed to start lecture session",
      details: error.message 
    });
  }
};
