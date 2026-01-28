import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getProfile,
  saveProfile,
  getJobs,
  applyJob,
  getApplications
} from "../controllers/studentController.js";

const router = express.Router();

// Get logged-in student profile
router.get("/profile", verifyToken, getProfile);

// Save/update student profile
router.patch("/profile", verifyToken, saveProfile);

// Get all approved jobs
router.get("/jobs", verifyToken, getJobs);

// Apply for a job
// backend/routes/studentRoutes.js
router.post("/apply/:jobId", verifyToken, applyJob);

// Get all applications of this student
router.get("/applications", verifyToken, getApplications);

export default router;
