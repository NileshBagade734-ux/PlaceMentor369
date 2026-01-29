import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { recruiterOnly } from "../middlewares/roleMiddleware.js";

import {
  createJob,
  getRecruiterJobs,
  getAllRecruiterApplications,
  deleteJob,
  updateApplicantStatus,
  getRecruiterDashboardStats
} from "../controllers/recruiterController.js";

const router = express.Router();

// ---------------- DASHBOARD ----------------
router.get("/dashboard", verifyToken, recruiterOnly, getRecruiterDashboardStats);

// ---------------- JOBS ----------------
router.post("/jobs", verifyToken, recruiterOnly, createJob);
router.get("/jobs", verifyToken, recruiterOnly, getRecruiterJobs);
router.delete("/jobs/:id", verifyToken, recruiterOnly, deleteJob);

// ---------------- APPLICATIONS ----------------
router.get("/applications", verifyToken, recruiterOnly, getAllRecruiterApplications);
router.patch("/applications/status", verifyToken, recruiterOnly, updateApplicantStatus);

export default router;
