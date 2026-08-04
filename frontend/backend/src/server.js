require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

let server;

/**
 * Connect to database and start Express server with graceful shutdown listeners
 */
const startServer = () => {
  try {
    // 1. Start Express listener immediately so platform health checks pass
    server = app.listen(PORT, () => {
      console.log(
        `🚀 FounderOS Backend Server running in ${
          process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
      );
    });

    // 2. Connect to MongoDB in background
    connectDB()
      .then(() => {
        console.log('✅ Connected to MongoDB Atlas successfully.');
      })
      .catch((err) => {
        console.warn('⚠️  MongoDB initial connection warning:', err.message);
      });
  } catch (error) {
    console.error(`❌ Failed to start HTTP server: ${error.message}`);
  }
};

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err.message);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds if connections hang
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Listen for process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections without crashing container
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Warning: ${err ? err.message || err : 'Unknown error'}`);
});

startServer();
