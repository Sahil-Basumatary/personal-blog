import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (uri, { isTest = false } = {}) => {
  try {
    const mongoUri = uri || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not set");
    }

    await mongoose.connect(mongoUri);

    if (!isTest) {
      console.log("MongoDB connected");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);

    if (isTest) {
      throw err;
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;