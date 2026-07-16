import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { studentOnly } from "../middlewares/roleMiddleware.js";
import {
  scheduleMockInterview,
  getStudentInterviews,
  getInterviewById,
  submitInterviewFeedback,
  getInterviewQuestions,
  getPreparationGuides,
  cancelInterview
} from "../controllers/mockInterviewController.js";

const router = express.Router();

// Mock interview scheduling and management
router.post("/schedule", protect, studentOnly, scheduleMockInterview);
router.get("/", protect, studentOnly, getStudentInterviews);
router.get("/:id", protect, getInterviewById);
router.post("/:id/feedback", protect, submitInterviewFeedback);
router.post("/:id/cancel", protect, studentOnly, cancelInterview);

// Interview preparation resources
router.get("/questions/list", protect, getInterviewQuestions);
router.get("/guides/list", protect, getPreparationGuides);

export default router;
