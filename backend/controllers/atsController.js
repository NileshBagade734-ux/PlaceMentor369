import Job from "../models/job.js";
import Student from "../models/student.js";
import { generateText } from "../utils/gemini.js";
import { analyzeResumeStructure } from "../utils/resumeParser.js";

/**
 * Evaluates candidate resume against target job requirements or general ATS standard
 */
export const evaluateATS = async (req, res) => {
  try {
    const { jobId, resumeText } = req.body;
    const studentId = req.user?.id;

    let targetJobSkills = [];
    let jobTitle = "General Placement Role";

    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        targetJobSkills = job.skillsRequired || [];
        jobTitle = job.title;
      }
    }

    let studentSkills = [];
    if (studentId) {
      const student = await Student.findOne({ userId: studentId });
      if (student && student.skills) {
        studentSkills = student.skills;
      }
    }

    const textToAnalyze = resumeText || studentSkills.join(", ");
    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Resume text or student skills profile is required for ATS evaluation."
      });
    }

    // Advanced Structural Analysis
    const structure = analyzeResumeStructure(textToAnalyze);

    // Keyword Extraction & Match Calculation
    const sanitizedText = textToAnalyze.toLowerCase();
    const matchedSkills = [];
    const missingSkills = [];

    targetJobSkills.forEach((skill) => {
      const lowerSkill = skill.toLowerCase();
      if (sanitizedText.includes(lowerSkill)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    let keywordScore = targetJobSkills.length > 0
      ? Math.round((matchedSkills.length / targetJobSkills.length) * 100)
      : 75;

    // Formatting & Structure checks
    const wordCount = structure.wordCount;
    let formatScore = 85;
    const formatIssues = [];

    if (wordCount < 100) {
      formatScore -= 20;
      formatIssues.push("Resume content is too brief. Aim for at least 300-500 words.");
    } else if (wordCount > 1000) {
      formatScore -= 10;
      formatIssues.push("Resume is lengthy. Keep content concise and targeted.");
    }

    if (!structure.hasEmail) {
      formatScore -= 5;
      formatIssues.push("Missing accessible email address in contact section.");
    }
    if (!structure.hasPhone) {
      formatScore -= 5;
      formatIssues.push("Missing accessible contact phone number.");
    }

    if (!structure.sectionsDetected.includes("Education")) {
      formatIssues.push("Missing explicit Education section header or credentials.");
    }

    if (!structure.sectionsDetected.includes("Experience") && !structure.sectionsDetected.includes("Projects")) {
      formatIssues.push("Missing explicit Work Experience or Projects section.");
    }

    const overallAtsScore = Math.round((keywordScore * 0.6) + (formatScore * 0.4));

    // AI Insight prompt using Gemini
    let aiRecommendations = [
      "Quantify achievements using metrics and metrics-driven impact.",
      "Include industry-standard keywords from target job descriptions.",
      "Ensure section headers follow standard resume naming conventions."
    ];

    try {
      const prompt = `Analyze this resume snippet for a "${jobTitle}" position. Key required skills: ${targetJobSkills.join(", ")}.\nResume Content: "${textToAnalyze.slice(0, 800)}"\nProvide 3 actionable ATS improvement tips as a bulleted list.`;
      const aiResponse = await generateText(prompt);
      if (aiResponse) {
        const lines = aiResponse.split("\n").filter((l) => l.trim().length > 0).slice(0, 3);
        if (lines.length > 0) {
          aiRecommendations = lines.map((l) => l.replace(/^[-*•\d.\s]+/, ""));
        }
      }
    } catch (err) {
      console.warn("Gemini AI ATS advice fallback:", err.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        jobTitle,
        overallScore: Math.min(100, Math.max(0, overallAtsScore)),
        keywordScore,
        formatScore,
        wordCount,
        structure,
        matchedSkills,
        missingSkills,
        formatIssues,
        recommendations: aiRecommendations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("ATS Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during ATS evaluation."
    });
  }
};
