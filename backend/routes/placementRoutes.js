import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/roleMiddleware.js";
import {
  recordPlacement,
  updatePlacementStatus,
  getStudentPlacements,
  getPlacementMetrics,
  verifyPlacement
} from "../controllers/placementController.js";

const router = express.Router();

// Student placement routes
router.post("/record", protect, recordPlacement);
router.get("/my-placements", protect, getStudentPlacements);
router.patch("/:id", protect, updatePlacementStatus);

// Admin/analytics routes
router.get("/metrics/dashboard", protect, getPlacementMetrics);
router.post("/:id/verify", protect, adminOnly, verifyPlacement);

export default router;
