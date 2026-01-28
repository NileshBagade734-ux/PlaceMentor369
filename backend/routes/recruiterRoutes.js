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

// Jobs routes
router.post("/jobs", verifyToken, recruiterOnly, createJob);
router.get("/jobs", verifyToken, recruiterOnly, getRecruiterJobs);
router.get("/jobs/:id/applicants", verifyToken, recruiterOnly, getJobApplicants);
router.delete("/jobs/:id", verifyToken, recruiterOnly, deleteJob);

// ✅ Update applicant status
router.patch("/applications/status", verifyToken, recruiterOnly, updateApplicantStatus);

export default router;
