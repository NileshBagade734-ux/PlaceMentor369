import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ JSON middleware with larger limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ CORS setup for multiple origins
const allowedOrigins = ["http://127.0.0.1:5500", "http://localhost:5500"];
app.use(cors({
    origin: function(origin, callback){
        if(!origin) return callback(null, true); // Postman etc.
        if(!allowedOrigins.includes(origin)) return callback(new Error("CORS not allowed"), false);
        return callback(null, true);
    },
    credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/recruiter", recruiterRoutes);

// Default 404
app.use((req,res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global Error:", err.stack);
    res.status(500).json({ message: "Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
