const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes = require('./routes/auth');
const ventureRoutes = require('./routes/ventures');
const chatRoutes = require('./routes/chat');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy header for platforms like Render, Railway, Fly.io, Heroku
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

// Enable CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
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

// HTTP request logger middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

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
