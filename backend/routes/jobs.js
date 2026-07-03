import express from "express";
import { createJob, getJobs, getApplicants, reportJobIssue, getCompanyAccuracy, expireOutdatedJobs } from "../controllers/jobController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { recruiterOnly, studentOnly } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Recruiter creates job
router.post("/", verifyToken, recruiterOnly, createJob);

// Students view all jobs
router.get("/", verifyToken, studentOnly, getJobs);

// Recruiter views applicants
router.get("/:id/applicants", verifyToken, recruiterOnly, getApplicants);

// Student reports job posting issue (Issue #356)
router.post("/:jobId/report", verifyToken, studentOnly, reportJobIssue);

// Get company accuracy report (Issue #356)
router.get("/company/:companyName/accuracy", verifyToken, getCompanyAccuracy);

// Admin endpoint: expire outdated jobs (Issue #356)
router.post("/admin/expire-outdated", verifyToken, expireOutdatedJobs);

export default router;
