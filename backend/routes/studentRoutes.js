import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

import {
  getProfile,
  saveProfile,
  getJobs,
  applyJob,
  getApplications,
  withdrawApplication
} from "../controllers/studentController.js";

const router = express.Router();

// Get logged-in student profile
router.get("/profile", verifyToken, getProfile);

// Save/update student profile
router.patch("/profile", verifyToken, saveProfile);

// Get all approved jobs
router.get("/jobs", verifyToken, getJobs);

// Apply for a job
router.post("/apply/:jobId", verifyToken, applyJob);

// Get all applications
router.get("/applications", verifyToken, getApplications);

// Withdraw application
router.patch(
  "/application/:id/withdraw",
  verifyToken,
  withdrawApplication
);

export default router;