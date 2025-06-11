require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");
const app = express();
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Frontend url here
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization",
};

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://apis.google.com"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "https://yourcdn.com"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
      },
    },
  })
);

// Connect to Database
connectDB();

// Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/images", express.static(path.join(__dirname, "/images")));

// Server Start
const PORT = process.env.PORT || 5060;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
