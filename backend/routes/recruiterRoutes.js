import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { recruiterOnly } from "../middlewares/roleMiddleware.js";

import {
  createJob,
  getRecruiterJobs,
  getAllRecruiterApplications,
  deleteJob,
  updateApplicantStatus,
  getRecruiterDashboardStats,
  getRecruiterAnalytics,
  exportJobApplicantsToCSV
} from "../controllers/recruiterController.js";

const router = express.Router();

// ---------------- DASHBOARD ----------------
router.get("/dashboard", verifyToken, recruiterOnly, getRecruiterDashboardStats);
router.get("/analytics", verifyToken, recruiterOnly, getRecruiterAnalytics);

// ---------------- JOBS ----------------
router.post("/jobs", verifyToken, recruiterOnly, createJob);
router.get("/jobs", verifyToken, recruiterOnly, getRecruiterJobs);
router.delete("/jobs/:id", verifyToken, recruiterOnly, deleteJob);

// ---------------- APPLICATIONS ----------------
router.get("/applications", verifyToken, recruiterOnly, getAllRecruiterApplications);
router.get("/applications/export", verifyToken, recruiterOnly, exportJobApplicantsToCSV);
router.patch("/applications/status", verifyToken, recruiterOnly, updateApplicantStatus);

export default router; 