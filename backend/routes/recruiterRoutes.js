import express from "express";
import {
  registerRecruiter,
  loginRecruiter,
  createJob,
  getRecruiterJobs,
  getJobApplicants,
  deleteJob,
  updateApplicantStatus
} from "../controllers/recruiterController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { recruiterOnly } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// 🔒 Auth routes
router.post("/register", registerRecruiter);
router.post("/login", loginRecruiter);

// 🔒 Job routes (protected)
router.post("/jobs", verifyToken, recruiterOnly, createJob);
router.get("/jobs", verifyToken, recruiterOnly, getRecruiterJobs);
router.get("/jobs/:id/applicants", verifyToken, recruiterOnly, getJobApplicants);
router.delete("/jobs/:id", verifyToken, recruiterOnly, deleteJob);

// 🔒 Update application status
router.patch("/applications", verifyToken, recruiterOnly, updateApplicantStatus);

export default router;
