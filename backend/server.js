// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import studentRoutes from "./routes/studentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";

dotenv.config();
const app = express();

/* ============================
   GLOBAL MIDDLEWARE
============================ */

// ✅ CORS (allow frontend URLs)
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"], // dev URLs
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
/* ============================
   MONGODB + SERVER START
============================ */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI) // no options needed in Mongoose v7+
  .then(() => {
    console.log("✅ MongoDB Connected successfully");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
