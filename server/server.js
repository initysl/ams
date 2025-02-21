require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/database");
const lectureRoutes = require("./routes/lectureRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();
app.use(express.json());
app.use(morgan("dev"));

// Connect to Database
connectDB();

// Routes
app.use("/api", lectureRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
// Server Start
const PORT = process.env.PORT || 5060;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
