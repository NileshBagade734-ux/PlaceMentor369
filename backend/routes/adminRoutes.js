import express from "express";
import {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getStudents,
  verifyStudent,
  getAllApplications
} from "../controllers/adminController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

/* =========================
   JOB ROUTES
========================= */
router.post("/jobs", protect, authorize("admin"), createJob);
router.get("/jobs", protect, authorize("admin"), getJobs);
router.put("/jobs/:jobId", protect, authorize("admin"), updateJob);
router.delete("/jobs/:jobId", protect, authorize("admin"), deleteJob);

/* =========================
   STUDENT ROUTES
========================= */
router.get("/students", protect, authorize("admin"), getStudents);
router.put("/students/verify/:studentId", protect, authorize("admin"), verifyStudent);

/* =========================
   APPLICATIONS ROUTES
========================= */
router.get("/applications", protect, authorize("admin"), getAllApplications);

export default router;
