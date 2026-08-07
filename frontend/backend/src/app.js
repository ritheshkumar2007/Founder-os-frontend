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
const coachRoutes = require('./routes/coach');
const reportsRoutes = require('./routes/reports');
const executionRoutes = require('./routes/execution');
const growthRoutes = require('./routes/growth');
const mvpRoutes = require('./routes/mvp');
const mvpScopeRoutes = require('./routes/mvpRoutes');
const roadmapRoutes = require('./routes/roadmap');
const buildRoadmapRoutes = require('./routes/roadmapRoutes');
const marketingRoutes = require('./routes/marketing');
const marketingPlanRoutes = require('./routes/marketingRoutes');
const launchRoutes = require('./routes/launch');
const launchSprintModuleRoutes = require('./routes/launchSprintRoutes');
const tractionRoutes = require('./routes/traction');
const tractionModuleRoutes = require('./routes/tractionRoutes');
const investorRoutes = require('./routes/investor');
const investorUpdateModuleRoutes = require('./routes/investorUpdateRoutes');
const founderAIRoutes = require('./routes/founderAIRoutes');
const intelligenceModuleRoutes = require('./routes/intelligenceRoutes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy header for platforms like Render, Railway, Fly.io, Heroku
app.set('trust proxy', 1);

// Universal CORS preflight middleware (Guarantees Access-Control-Allow-Origin header on ALL origins)
app.use((req, res, next) => {
  const reqOrigin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', reqOrigin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Enable standard cors middleware
app.use(cors({
  origin: true,
  credentials: true,
}));

// Security HTTP headers (configured to not block cross-origin requests)
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Parse JSON request body
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse Cookie header
app.use(cookieParser());

// Sanitize user input against NoSQL query injection
app.use(mongoSanitize());

// HTTP request logger in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint for monitoring & platform deployment checks
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ventures', ventureRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/execution', executionRoutes);
app.use('/api/growth', growthRoutes);
app.use('/api/mvp-scope', mvpScopeRoutes);
app.use('/api/roadmap', buildRoadmapRoutes);
app.use('/api/marketing-plan', marketingPlanRoutes);
app.use('/api/launch-sprint', launchSprintModuleRoutes);
app.use('/api/traction', tractionModuleRoutes);
app.use('/api/investor-update', investorUpdateModuleRoutes);
app.use('/api/founder-ai', founderAIRoutes);
app.use('/api/intelligence', intelligenceModuleRoutes);

// Module route aliases for workspace endpoints
app.use('/api/ventures/:ventureId/mvp-scope', mvpRoutes);
app.use('/api/ventures/:ventureId/roadmap', roadmapRoutes);
app.use('/api/ventures/:ventureId/marketing-plan', marketingRoutes);
app.use('/api/ventures/:ventureId/launch-sprint', launchRoutes);
app.use('/api/ventures/:ventureId/traction', tractionRoutes);
app.use('/api/ventures/:ventureId/investor-update', investorRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found - ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
