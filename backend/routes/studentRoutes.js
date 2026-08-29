import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  saveProfile,
  getJobs,
  getRecommendedJobs,
  applyJob,
  getApplications,
  getSkillGapAnalysis,
  getSkillGapForJob,
  getLearningPaths,
  uploadResume,
  getAtsDashboard
} from "../controllers/studentController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Get logged-in student profile
router.get("/profile", verifyToken, getProfile);

// Save/update student profile
router.patch("/profile", verifyToken, saveProfile);

// Get all approved jobs & recommendations
router.get("/jobs", verifyToken, getJobs);
router.get("/recommended-jobs", verifyToken, getRecommendedJobs);

// Apply for a job
router.post("/apply/:jobId", verifyToken, applyJob);

// Get all applications of this student
router.get("/applications", verifyToken, getApplications);

// AI-powered skill gap analysis for a specific job
router.get("/skill-gap/:jobId", verifyToken, getSkillGapAnalysis);

// Skill Gap Analysis: Detailed skill gap for specific job
router.get("/skill-gap-detailed/:jobId", verifyToken, getSkillGapForJob);

// Skill Gap Analysis: Get personalized learning paths based on all jobs
router.get("/learning-paths", verifyToken, getLearningPaths);

// GET ATS Resume Dashboard Data
router.get("/ats-dashboard", verifyToken, getAtsDashboard);

import { uploadLimiter } from "../middlewares/rateLimiter.js";

// Upload resume and parse via AI (rate limited)
router.post(
  "/upload-resume",
  verifyToken,
  uploadLimiter,
  upload.single("resume"),
  uploadResume
);

export default router;
