import express from "express";
import { evaluateATS } from "../controllers/atsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

const validateAtsInput = (req, res, next) => {
  const { resumeText, jobId } = req.body || {};
  if (!resumeText && !jobId) {
    return res.status(400).json({
      success: false,
      message: "Please provide either resumeText or a valid jobId for evaluation."
    });
  }
  next();
};

// POST /api/ats/evaluate - Analyze candidate resume against ATS criteria
router.post("/evaluate", protect, validateAtsInput, evaluateATS);

export default router;
