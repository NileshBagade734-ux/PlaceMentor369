import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  saveProfile,
  getJobs,
  applyJob,
  getApplications,
<<<<<<< HEAD
  getSkillGapForJob,
  getLearningPaths,
=======
  getSkillGapAnalysis,
>>>>>>> 819041916b458ef9db032563e7e11c4a0fbc1f34
  uploadResume
} from "../controllers/studentController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Get logged-in student profile
router.get("/profile", verifyToken, getProfile);

// Save/update student profile
router.patch("/profile", verifyToken, saveProfile);

// Get all approved jobs
router.get("/jobs", verifyToken, getJobs);

// Apply for a job
router.post("/apply/:jobId", verifyToken, applyJob);

// Get all applications of this student
router.get("/applications", verifyToken, getApplications);

<<<<<<< HEAD
// Skill Gap Analysis: Analyze gap for specific job
router.get("/skill-gap/:jobId", verifyToken, getSkillGapForJob);

// Skill Gap Analysis: Get personalized learning paths based on all jobs
router.get("/learning-paths", verifyToken, getLearningPaths);
// Upload resume and parse via AI
router.post("/upload-resume", verifyToken, upload.single("resume"), uploadResume);
=======
// AI-powered skill gap analysis for a specific job
router.get("/skill-gap/:jobId", verifyToken, getSkillGapAnalysis);
>>>>>>> 819041916b458ef9db032563e7e11c4a0fbc1f34

// Upload resume and parse via AI
router.post(
  "/upload-resume",
  verifyToken,
  upload.single("resume"),
  uploadResume
);

export default router;