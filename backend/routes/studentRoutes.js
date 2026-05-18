import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { uploadResume } from "../middlewares/uploadMiddleware.js";
import {
  getProfile,
  saveProfile,
  getJobs,
  applyJob,
  getApplications,
  uploadResumeFile
} from "../controllers/studentController.js";

const router = express.Router();

// Get logged-in student profile
router.get("/profile", verifyToken, getProfile);

// Save/update student profile
router.patch("/profile", verifyToken, saveProfile);

// Upload resume file
router.post("/resume", verifyToken, uploadResume, uploadResumeFile);

// Get all approved jobs
router.get("/jobs", verifyToken, getJobs);

// Apply for a job
router.post("/apply/:jobId", verifyToken, applyJob);

// Get all applications of this student
router.get("/applications", verifyToken, getApplications);

export default router;
