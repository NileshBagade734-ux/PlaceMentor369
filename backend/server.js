// backend/server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { QueueEvents } from "bullmq";
import redisConnection from "./config/redis.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";

// Routes
import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config({ override: true });

// Initialize Background Workers
import "./workers/aiWorker.js";

const app = express();
const httpServer = createServer(app);

// ✅ Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true
  }
});

// Store connected users (Map: userId -> socketId)
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // When frontend identifies itself
  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`🔗 User ${userId} registered to socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    // Remove from map on disconnect
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ✅ Listen to BullMQ Global Queue Events for AI Completion
if (redisConnection) {
  const queueEvents = new QueueEvents('ai-analysis-queue', { connection: redisConnection });
  queueEvents.on('completed', async ({ jobId, returnvalue }) => {
    try {
      // returnvalue is a JSON string of the returned object { success, userId, aiResult }
      const result = typeof returnvalue === 'string' ? JSON.parse(returnvalue) : returnvalue;
      if (result && result.userId) {
        const socketId = connectedUsers.get(result.userId);
        if (socketId) {
          console.log(`🚀 Emitting 'ai-completed' to user ${result.userId} on socket ${socketId}`);
          io.to(socketId).emit("ai-completed", { message: "AI Analysis Complete!" });
        }
      }
    } catch (err) {
      console.error("Error processing queue event:", err);
    }
  });
}

/* ============================
   GLOBAL MIDDLEWARE
============================ */

// ✅ CORS (allow frontend URLs)
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
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

// 404 Route
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

// Global Error Handler (must be last)
app.use(errorHandler);

/* ============================
   MONGODB + SERVER START
============================ */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
