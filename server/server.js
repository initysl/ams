require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const lectureRoutes = require("./routes/lectureRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();
app.use(express.json());

// Connect to Database
connectDB();

// Server Start
const PORT = process.env.PORT || 5060;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
