import MockInterview from "../models/mockInterview.js";
import InterviewQuestion from "../models/interviewQuestion.js";
import PreparationGuide from "../models/preparationGuide.js";

export const scheduleMockInterview = async (req, res) => {
  try {
    const { jobRole, company, scheduledDate } = req.body;

    if (!jobRole || !scheduledDate) {
      return res.status(400).json({ message: "Job role and scheduled date are required" });
    }

    const scheduled = new Date(scheduledDate);
    if (scheduled <= new Date()) {
      return res.status(400).json({ message: "Scheduled date must be in the future" });
    }

    const mockInterview = await MockInterview.create({
      student: req.user._id,
      jobRole,
      company: company || "",
      scheduledDate: scheduled,
      status: "scheduled"
    });

    res.status(201).json({ success: true, message: "Mock interview scheduled", mockInterview });
  } catch (err) {
    console.error("Schedule Interview Error:", err);
    res.status(500).json({ message: "Failed to schedule mock interview" });
  }
};

export const getStudentInterviews = async (req, res) => {
  try {
    const interviews = await MockInterview.find({ student: req.user._id })
      .populate("questions")
      .sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    console.error("Get Interviews Error:", err);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.id)
      .populate("questions")
      .populate("student", "name email");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.student._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(interview);
  } catch (err) {
    console.error("Get Interview Error:", err);
    res.status(500).json({ message: "Failed to fetch interview" });
  }
};

export const submitInterviewFeedback = async (req, res) => {
  try {
    const { communicationScore, technicalScore, confidenceScore, strengths, improvements, comments } = req.body;

    const interview = await MockInterview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const overallScore = Math.round(
      (communicationScore + technicalScore + confidenceScore) / 3
    );

    interview.feedback = {
      communicationScore: Math.min(100, Math.max(0, communicationScore)),
      technicalScore: Math.min(100, Math.max(0, technicalScore)),
      confidenceScore: Math.min(100, Math.max(0, confidenceScore)),
      overallScore,
      strengths: strengths || [],
      improvements: improvements || [],
      comments: comments || ""
    };

    interview.status = "completed";
    await interview.save();

    res.json({ success: true, message: "Feedback submitted", interview });
  } catch (err) {
    console.error("Submit Feedback Error:", err);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
};

export const getInterviewQuestions = async (req, res) => {
  try {
    const { jobRole, category, difficulty } = req.query;
    const filter = {};

    if (jobRole) filter.jobRole = jobRole;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await InterviewQuestion.find(filter).limit(20);
    res.json(questions);
  } catch (err) {
    console.error("Get Questions Error:", err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

export const getPreparationGuides = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const guides = await PreparationGuide.find(filter).sort({ createdAt: -1 });
    res.json(guides);
  } catch (err) {
    console.error("Get Guides Error:", err);
    res.status(500).json({ message: "Failed to fetch guides" });
  }
};

export const cancelInterview = async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    interview.status = "cancelled";
    await interview.save();

    res.json({ success: true, message: "Interview cancelled" });
  } catch (err) {
    console.error("Cancel Interview Error:", err);
    res.status(500).json({ message: "Failed to cancel interview" });
  }
};
