require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");
const app = express();
const lectureRoutes = require("./routes/lectureRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// Frontend url here
const corsOptions = {
  // origin: "PROCESS.env.CLIENT_URL",
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
        scriptSrc: ["'self'", "'https://apis.google.com'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "https://yourcdn.com"],
        contentSrc: ["'self'"],
        fontSrc: ["'self'"],
      },
    },
    XssFilter: true, //Enable X-XSS Filter Protection Header
  })
);

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
