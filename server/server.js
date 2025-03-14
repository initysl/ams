require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const connectDB = require("./config/database");
const app = express();
const lectureRoutes = require("./routes/lectureRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Frontend url here
const corsOptions = {
  //   origin: "http://localhost:3000",
  credentials: true,
};

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors(corsOptions));

// Connect to Database
connectDB();

// Routes
app.use("/api", lectureRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Server Start
const PORT = process.env.PORT || 5060;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
