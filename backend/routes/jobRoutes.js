import express from "express";
import { createJob, getJobs } from "../controllers/jobController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Recruiter creates job
router.post("/", protect, createJob);

// Student sees jobs
router.get("/", protect, getJobs);

export default router; // ✅ ESM export
