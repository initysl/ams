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

// Connect to Database (never kills the process: a dead process means the
// platform returns a 502 with no CORS headers, which masks the real error)
connectDB();

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/images', express.static(path.join(__dirname, '/public/images')));

// Server Start
const PORT = process.env.PORT || 5060;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
