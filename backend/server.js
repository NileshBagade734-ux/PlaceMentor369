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

/* ============================
   ENVIRONMENT VALIDATION
============================ */
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingVars.join(", ")}`
  );
  console.error(
    "   → Create a .env file in the backend/ directory with MONGO_URI and JWT_SECRET"
  );
  process.exit(1);
}

const app = express();

/* ============================
   GLOBAL MIDDLEWARE
============================ */

// ✅ CORS (allow frontend URLs)
app.use(
  cors({
    origin: true, // dynamically allow any frontend port
    credentials: true,
  })
);

// ✅ Body parsers
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ============================
   ROUTES
============================ */

// Health check
app.get("/", (req, res) =>
  res.status(200).json({
    status: "ok",
    message: "🚀 PlacementorAI Backend Running!",
    timestamp: new Date().toISOString(),
  })
);

// Auth routes
app.use("/api/auth", authRoutes);

// Student routes
app.use("/api/student", studentRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/admin", adminRoutes);

// 404 Route
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ============================
   MONGODB + SERVER START
============================ */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI) // no options needed in Mongoose v7+
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
    const server = app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );

    /* ============================
       GRACEFUL SHUTDOWN
    ============================ */
    const shutdown = async (signal) => {
      console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log("✅ MongoDB connection closed.");
        } catch (err) {
          console.error("❌ Error closing MongoDB:", err.message);
        }
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful fails
      setTimeout(() => {
        console.error("❌ Forced shutdown after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
