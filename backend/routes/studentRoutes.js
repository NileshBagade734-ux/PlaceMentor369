// backend/routes/studentRoutes.js
import express from "express";
import {
  getProfile,
  updateProfile,
  getAppliedJobs,
  applyJob,
  getStudentJobs
} from "../controllers/studentController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* ================================
   STUDENT PROFILE ROUTES
================================ */

// get student profile
router.get("/profile", protect, authorize("student"), getProfile);

// update/create student profile
router.post("/profile", protect, authorize("student"), updateProfile);

/* ================================
   JOBS & APPLICATIONS
================================ */

// list all available jobs
router.get("/jobs", protect, authorize("student"), getStudentJobs);

// apply for a job
router.post("/apply/:jobId", protect, authorize("student"), applyJob);

// get my applied jobs
router.get("/applications", protect, authorize("student"), getAppliedJobs);

export default router;
