// backend/routes/recruiterRoutes.js
import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { recruiterOnly } from "../middlewares/roleMiddleware.js";
import {
  createJob,
  getRecruiterJobs,
  getJobApplicants,
  deleteJob,
  updateApplicantStatus
} from "../controllers/recruiterController.js";

const router = express.Router();

// ------------------ Jobs Routes ------------------
// Create a new job
router.post("/jobs", verifyToken, recruiterOnly, createJob);

// Get all jobs posted by this recruiter
router.get("/jobs", verifyToken, recruiterOnly, getRecruiterJobs);

// Get applicants for a specific job
router.get("/jobs/:id/applicants", verifyToken, recruiterOnly, getJobApplicants);

// Delete a job
router.delete("/jobs/:id", verifyToken, recruiterOnly, deleteJob);

// Update applicant status (optional route)
router.patch("/applications/status", verifyToken, recruiterOnly, updateApplicantStatus);

export default router;
