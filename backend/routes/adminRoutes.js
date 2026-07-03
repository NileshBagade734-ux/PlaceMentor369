import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/roleMiddleware.js";
import {
  getDashboardStats,
  getAllStudents,
  verifyStudent,
  rejectStudent,
  getAllJobs,
  approveJob,
  deleteJob
} from "../controllers/adminController.js";
import {
  getAnalytics,
  updateApplicationOutcome,
  getPlacementMetrics,
  getApplicationAuditTrail
} from "../controllers/analyticsController.js";

const router = express.Router();

/* DASHBOARD */
router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/analytics", protect, adminOnly, getAnalytics);

/* PLACEMENT TRACKING (Issue #354) */
router.get("/analytics/placement-metrics", protect, adminOnly, getPlacementMetrics);
router.patch("/applications/:id/status", protect, adminOnly, updateApplicationOutcome);
router.get("/applications/:id/audit-trail", protect, adminOnly, getApplicationAuditTrail);

/* STUDENTS */
router.get("/students", protect, adminOnly, getAllStudents);
router.patch("/students/:id/verify", protect, adminOnly, verifyStudent);
router.patch("/students/:id/reject", protect, adminOnly, rejectStudent);

/* JOBS */
router.get("/jobs", protect, adminOnly, getAllJobs);
router.patch("/jobs/:id/approve", protect, adminOnly, approveJob);
router.delete("/jobs/:id", protect, adminOnly, deleteJob);

export default router;
