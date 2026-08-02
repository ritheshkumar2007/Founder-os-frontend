const mongoose = require('mongoose');

/**
 * Connect to MongoDB database using Mongoose.
 * Logs clear connection status without crashing Express server when credentials are being updated.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<db_password>') || uri.includes('<password>')) {
    console.warn('⚠️ MONGODB_URI missing or contains placeholder.');
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Warning: ${error.message}`);
  }
};

module.exports = connectDB;
