const express = require("express");
const { startLectureSession } = require("../controllers/lectureController");
const router = express.Router();

// Routes here
router.post("/start-session", startLectureSession);

module.exports = router;
