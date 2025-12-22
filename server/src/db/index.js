import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (
  mongoUri = process.env.MONGODB_URI,
  { isTest = false } = {}
) => {
  try {
    await mongoose.connect(mongoUri);
    if (!isTest) {
      console.log("MongoDB connected");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);

    if (isTest || process.env.NODE_ENV === "test") {
      throw err;
    }

    process.exit(1);
  }
};

export default connectDB;