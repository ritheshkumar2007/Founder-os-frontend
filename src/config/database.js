const mongoose = require('mongoose');

/**
 * Connect to MongoDB database using Mongoose.
 * Logs clear connection status without crashing Express server when credentials are being updated.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<db_password>') || uri.includes('<password>')) {
    throw new Error('MONGODB_URI is missing or contains placeholder in environment variables.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
