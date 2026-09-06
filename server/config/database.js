const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    const connect = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      "Database connected successfully:",
      connect.connection.host,
      connect.connection.name
    );

    return connect;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

module.exports = connectDB;
