const mongoose = require("mongoose");

const RETRY_DELAY_MS = 5000;

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(
      "Database connected successfully:",
      connect.connection.host,
      connect.connection.name
    );
  } catch (error) {
    // Do not exit: the HTTP server must stay up so requests get a real
    // (CORS-enabled) error instead of a platform 502 with no headers.
    console.error("Database connection failed, retrying in 5s:", error.message);
    setTimeout(connectDB, RETRY_DELAY_MS);
  }
};

module.exports = connectDB;
