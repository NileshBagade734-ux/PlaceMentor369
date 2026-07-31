import express from "express";
import { evaluateATS } from "../controllers/atsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/ats/evaluate - Analyze candidate resume against ATS criteria
router.post("/evaluate", protect, evaluateATS);

export default router;
