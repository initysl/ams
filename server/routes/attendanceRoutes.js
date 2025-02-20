const express = require("express");
const { markAttendance } = require("../controllers/attendanceController");
const router = express.Router();

// Routes here
router.post("/mark-attendance", markAttendance);

module.exports = router;
