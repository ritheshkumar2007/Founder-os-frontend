const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const ventureRoutes = require('./routes/ventures');
const chatRoutes = require('./routes/chat');
const aiRoutes = require('./routes/ai');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy header for platforms like Render, Railway, Fly.io, Heroku
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

// Enable CORS
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Parse JSON request body
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Prevent NoSQL query injection
app.use(mongoSanitize());

// Ensure Database Connection Middleware
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      return res.status(503).json({
        success: false,
        message: `Database connection error: ${err.message}`,
        help: 'Please check MONGODB_URI in Render Environment Variables and MongoDB Atlas IP Whitelist (0.0.0.0/0).',
      });
    }
  }
  next();
});

// HTTP request logger middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '🚀 FounderOS Backend REST API is live and active.',
    healthCheck: '/api/health',
    documentation: 'API endpoints available at /api/*',
  });
});

// Health check endpoint (for deployment platforms & load balancers)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    service: 'FounderOS Production Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Legacy /health endpoint compatibility
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FounderOS Backend API',
  });
});

// API Routes with Rate Limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/ventures', apiLimiter, ventureRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', apiLimiter, aiRoutes);

// 404 Catch-All Handler for Undefined Routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
    errors: [],
  });
});

// Centralized global error handling middleware
app.use(errorHandler);

module.exports = app;
