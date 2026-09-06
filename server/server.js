require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const app = express();
const attendanceRoutes = require('./routes/attendanceRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Frontend urls here (CLIENT_URL may hold a comma-separated list)
const allowedOrigins = [
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean),
  'https://attendease.yusola.pro',
  'https://www.attendease.yusola.pro',
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server / curl requests that send no Origin header
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", ...allowedOrigins],
        fontSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com', // Google Fonts assets
        ],
        objectSrc: ["'none'"], // Prevents Flash, Java applets, etc. (security best practice)
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    // Static uploads/images are fetched from the frontend origin
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Fail loudly at boot if required config is missing, instead of throwing an
// opaque 500 on the first request that needs it.
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`FATAL: missing required env vars: ${missingEnv.join(', ')}`);
}

// Connect to Database (never kills the process: a dead process means the
// platform returns a 502 with no CORS headers, which masks the real error)
connectDB();

app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    db: states[mongoose.connection.readyState] || 'unknown',
    missingEnv,
  });
});

// Every API route below needs the database. Answer immediately with a clear
// 503 rather than letting queries hang until they time out as an opaque 500.
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      code: 'DB_UNAVAILABLE',
      message: 'Database is unavailable. Please try again shortly.',
    });
  }
  next();
});

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/images', express.static(path.join(__dirname, '/public/images')));

// Central error handler: without this, Express replies with an HTML stack page
// and the real cause never reaches the logs in a readable form.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message:
      status === 500
        ? 'Something went wrong on our end. Please try again.'
        : err.message,
    ...(process.env.NODE_ENV !== 'production' && { error: err.message }),
  });
});

// A crash here means the platform serves a headerless 502 on every route, so
// log it and keep serving.
process.on('unhandledRejection', (reason) =>
  console.error('Unhandled promise rejection:', reason)
);
process.on('uncaughtException', (err) =>
  console.error('Uncaught exception:', err)
);

// Server Start
const PORT = process.env.PORT || 5060;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
