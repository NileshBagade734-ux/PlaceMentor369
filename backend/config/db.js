import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod;

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.USE_IN_MEMORY === "true") {
      mongod = await MongoMemoryServer.create();
      process.env.MONGO_URI = mongod.getUri();
      console.log("Using in-memory MongoDB at", process.env.MONGO_URI);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const stopDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
    console.log("In-memory MongoDB stopped");
  } catch (err) {
    console.error("Error stopping DB:", err.message);
  }
};

export default connectDB;
export { stopDB };
