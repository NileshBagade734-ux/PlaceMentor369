import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected successfully", { scope: "database" });
  } catch (error) {
    logger.error("MongoDB connection failure", { scope: "database", error: error.message });
    process.exit(1);
  }
};

export default connectDB;
