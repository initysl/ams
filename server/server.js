require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const app = express();
const attendanceRoutes = require('./routes/attendanceRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.set('trust proxy', 1);

// 1. Enable CORS first (with a fallback to your production frontend URL if env is missing)
const allowedOrigin = process.env.CLIENT_URL || 'https://attendease.yusola.pro';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 2. Standard Parsers
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// 3. Clean and Safe Helmet Config
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disabling CSP temporarily simplifies cross-domain assets and cuts crash risks
  })
);

// Connect to Database
connectDB();

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/images', express.static(path.join(__dirname, '/public/images')));

// Server Start
const PORT = process.env.PORT || 5060;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
