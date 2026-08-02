const mongoose = require('mongoose');

/**
 * Connect to MongoDB database using Mongoose.
 * Logs clear connection status without crashing Express server when credentials are being updated.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<db_password>') || uri.includes('<password>')) {
    console.warn('\n=============================================================');
    console.warn('⚠️  MONGODB CONFIGURATION NOTICE:');
    console.warn('The MONGODB_URI in frontend/backend/.env contains placeholder "<db_password>".');
    console.warn('Please update frontend/backend/.env with your actual MongoDB Atlas password.');
    console.warn('Example: MONGODB_URI=mongodb+srv://user:PASSWORD@cluster.mongodb.net/founderos');
    console.warn('Or local MongoDB: MONGODB_URI=mongodb://127.0.0.1:27017/founderos');
    console.warn('=============================================================\n');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Warning: ${error.message}`);
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('👉 Cause: Incorrect MongoDB username or password in frontend/backend/.env');
    }
  }
};

module.exports = connectDB;
