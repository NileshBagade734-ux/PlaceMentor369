import express from "express";
import { createJob, getJobs, getApplicants } from "../controllers/jobController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { recruiterOnly, studentOnly } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Recruiter creates job
router.post("/", verifyToken, recruiterOnly, createJob);

// Students view all jobs
router.get("/", verifyToken, studentOnly, getJobs);

// Recruiter views applicants
router.get("/:id/applicants", verifyToken, recruiterOnly, getApplicants);

export default router;
