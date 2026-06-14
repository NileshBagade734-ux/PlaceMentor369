// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

/* ============================
   GLOBAL MIDDLEWARE
============================ */

// ✅ CORS (allow frontend URLs)
app.use(
  cors({
    origin: true, // dynamically allow any frontend port
    credentials: true
  })
);

// ✅ Body parsers
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ============================
   ROUTES
============================ */

// Health check
app.get("/", (req, res) => res.status(200).send("🚀 PlacementorAI Backend Running!"));

// Auth routes
app.use("/api/auth", authRoutes);

// Student routes
app.use("/api/student", studentRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/admin", adminRoutes);

// Custom Global Error Handler
import globalErrorHandler from "./middlewares/errorMiddleware.js";
import AppError from "./utils/AppError.js";

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Register Global Error Handling Middleware
app.use(globalErrorHandler);

/* ============================
   PROCESS & SHUTDOWN HANDLING
============================ */
let shuttingDown = false;
let server;

const gracefulShutdown = async (err = null) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('🛑 SIGTERM/SIGINT or Fatal Error received. Shutting down gracefully...');
  
  if (err) {
    console.error('💥 Fatal Error:', err);
  }

  if (server) {
    server.close(async () => {
      console.log('✅ HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        console.log('✅ MongoDB connection closed.');
        process.exit(err ? 1 : 0);
      } catch (dbErr) {
        console.error('❌ Error closing MongoDB connection:', dbErr);
        process.exit(1);
      }
    });
  } else {
    try {
      await mongoose.connection.close(false);
      process.exit(err ? 1 : 0);
    } catch (dbErr) {
      process.exit(1);
    }
  }

  setTimeout(() => {
    console.error('⚠️ Force shutting down...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown());
process.on('SIGINT', () => gracefulShutdown());

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(reason);
  gracefulShutdown(reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  gracefulShutdown(err);
});

/* ============================
   MONGODB + SERVER START
============================ */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
    server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
