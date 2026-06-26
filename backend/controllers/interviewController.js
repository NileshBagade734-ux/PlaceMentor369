import { generateInterviewQuestions, evaluateInterviewAnswers } from '../utils/interviewAi.js';

export const generateQuestions = async (req, res) => {
  try {
    const { jobId, resumeText, jobDescription } = req.body;
    
    // Fallback descriptions if not provided in request
    const fallbackResume = "Student with experience in React, Node.js, and MongoDB. Looking for a frontend role.";
    const fallbackJob = "Frontend Developer role. Requirements: React, CSS, Javascript.";

    const questionsData = await generateInterviewQuestions(
      resumeText || fallbackResume,
      jobDescription || fallbackJob
    );

    res.status(200).json({
      success: true,
      questions: questionsData.questions
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to generate questions" });
  }
};

export const evaluateAnswers = async (req, res) => {
  try {
    const { questions, answers } = req.body;

    if (!questions || !answers || questions.length !== answers.length) {
      return res.status(400).json({ success: false, message: "Invalid questions or answers data" });
    }

    const evaluationData = await evaluateInterviewAnswers(questions, answers);

    res.status(200).json({
      success: true,
      evaluation: evaluationData
    });
  } catch (error) {
    console.error("Error evaluating answers:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to evaluate answers" });
  }
};
