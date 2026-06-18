// backend/server.js

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { QueueEvents } from "bullmq";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Config
import redisConnection from "./config/redis.js";

// Routes
import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Error Handling
import globalErrorHandler from "./middlewares/errorMiddleware.js";
import AppError from "./utils/AppError.js";

// Workers
import "./workers/aiWorker.js";

dotenv.config({ override: true });

const app = express();
const httpServer = createServer(app);

/* ============================
   CORS CONFIGURATION
============================ */
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

/* ============================
   SOCKET.IO
============================ */
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Store connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 Client Connected: ${socket.id}`);

  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`🔗 User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }

    console.log(`🔌 Socket Disconnected: ${socket.id}`);
  });
});

/* ============================
   BULLMQ QUEUE EVENTS
============================ */
if (redisConnection) {
  const queueEvents = new QueueEvents("ai-analysis-queue", {
    connection: redisConnection,
  });

  queueEvents.on("completed", async ({ jobId, returnvalue }) => {
    try {
      console.log(`✅ Job Completed: ${jobId}`);

      const result =
        typeof returnvalue === "string"
          ? JSON.parse(returnvalue)
          : returnvalue;

      if (result?.userId) {
        const socketId = connectedUsers.get(result.userId);

        if (socketId) {
          console.log(
            `🚀 Emitting ai-completed to user ${result.userId}`
          );

          io.to(socketId).emit("ai-completed", {
            success: true,
            message: "AI Analysis Complete!",
            data: result.aiResult,
          });
        }
      }
    } catch (error) {
      console.error("❌ Queue Event Error:", error);
    }
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.error(
      `❌ Job Failed: ${jobId}, Reason: ${failedReason}`
    );
  });
}

/* ============================
   GLOBAL MIDDLEWARE
============================ */

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);

/* ============================
   HEALTH CHECK
============================ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 PlacementorAI Backend Running!",
  });
});

/* ============================
   API ROUTES
============================ */
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/admin", adminRoutes);

/* ============================
   404 ROUTE HANDLER
============================ */
app.use((req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404
    )
  );
});

/* ============================
   GLOBAL ERROR HANDLER
============================ */
app.use(globalErrorHandler);

/* ============================
   PROCESS ERROR HANDLING
============================ */

process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION!");
  console.error(err);

  httpServer.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION!");
  console.error(err);

  process.exit(1);
});

/* ============================
   GRACEFUL SHUTDOWN
============================ */

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down...`);

  try {
    httpServer.close(async () => {
      console.log("✅ HTTP Server Closed");

      await mongoose.connection.close();
      console.log("✅ MongoDB Connection Closed");

      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Shutdown Error:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

/* ============================
   DATABASE + SERVER START
============================ */

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    httpServer.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });