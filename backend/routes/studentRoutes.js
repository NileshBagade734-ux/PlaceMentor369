import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  saveProfile,
  getJobs,
  applyJob,
  getApplications
} from "../controllers/studentController.js";

const router = express.Router();

// Profile
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, saveProfile);

// Jobs
router.get("/jobs", protect, getJobs);
router.post("/apply/:jobId", protect, applyJob);

// Applications
router.get("/applications", protect, getApplications);

export default router;
