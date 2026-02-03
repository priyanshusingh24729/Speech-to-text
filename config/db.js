const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "MONGODB_URI is not set in your environment (.env file). The server will start, but database operations will fail."
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error(
      "❌ MongoDB connection error (server will still run, but DB ops will fail):",
      error.message
    );
  }
}

module.exports = connectDB;

