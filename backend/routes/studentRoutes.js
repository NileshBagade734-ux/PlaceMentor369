import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getProfile,
  saveProfile,
  getJobs,
  applyJob,
  getApplications,
  toggleBookmarkJob,
  getBookmarkedJobs
} from "../controllers/studentController.js";

const router = express.Router();

// Get logged-in student profile
router.get("/profile", verifyToken, getProfile);

// Save/update student profile
router.patch("/profile", verifyToken, saveProfile);

// Get all approved jobs
router.get("/jobs", verifyToken, getJobs);

// Bookmark a job
router.post("/jobs/:jobId/bookmark", verifyToken, toggleBookmarkJob);

// Get all bookmarked jobs
router.get("/bookmarks", verifyToken, getBookmarkedJobs);

// Apply for a job
// backend/routes/studentRoutes.js
router.post("/apply/:jobId", verifyToken, applyJob);

// Get all applications of this student
router.get("/applications", verifyToken, getApplications);

export default router;
