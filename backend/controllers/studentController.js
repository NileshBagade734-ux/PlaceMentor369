import mongoose from "mongoose";
import Student from "../models/student.js";
import Job from "../models/job.js";
import Application from "../models/application.js";
import { analyzeResume } from "../utils/gemini.js";
import { parseResume } from "../utils/resumeParser.js";

// Determine readiness tier based on match score
function getReadinessTier(score) {
  if (score >= 85)
    return {
      label: "Job Ready",
      color: "green",
      icon: "🟢",
      advice: "You're well-prepared for this role. Polish your resume and apply with confidence."
    };

  if (score >= 65)
    return {
      label: "Almost Ready",
      color: "blue",
      icon: "🔵",
      advice: "You meet the core requirements. Close the skill gaps below to maximise your chances."
    };

  if (score >= 40)
    return {
      label: "Developing",
      color: "yellow",
      icon: "🟡",
      advice: "You have a foundation but need to build more skills. Focus on the top missing skills first."
    };

  return {
    label: "Needs Work",
    color: "red",
    icon: "🔴",
    advice: "Significant preparation is needed. Use the learning recommendations to start your journey."
  };
}

/* ============================
    GET LOGGED-IN STUDENT PROFILE
============================ */
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    // Frontend expects empty object if profile does not exist
    if (!student) return res.json({});

    res.json(student);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================
    SAVE / UPDATE PROFILE
============================ */
export const saveProfile = async (req, res) => {
  try {
    const { name, roll, branch, cgpa, college, skills, resume } = req.body;

    let student = await Student.findOne({ user: req.user.id });

    if (!student) {
      student = new Student({ user: req.user.id });
    }

    student.name = name || "";
    student.roll = roll || "";
    student.branch = branch || "";
    student.cgpa = cgpa || 0;
    student.college = college || "";
    student.skills = skills || [];
    student.resume = resume || "";

    await student.save();

    res.status(200).json({
      message: "Profile saved successfully",
      student
    });
  } catch (err) {
    console.error("SAVE PROFILE ERROR:", err);
    res.status(500).json({ message: "Save failed" });
  }
};

/* ============================
    GET JOBS
============================ */
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "approved" });
    res.json(jobs);
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

/* ============================
    APPLY JOB
============================ */
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const studentProfile = await Student.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(400).json({ message: "Complete your profile first" });
    }

    const exists = await Application.findOne({
      student: studentProfile._id,
      job: jobId
    });
    if (exists) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      student: studentProfile._id,
      job: jobId
    });

    job.applicants.push(application._id);
    await job.save();

    res.json({
      message: "Application sent successfully",
      application
    });
  } catch (err) {
    console.error("APPLY JOB ERROR:", err);
    res.status(500).json({ message: "Failed to apply" });
  }
};

/* ============================
    GET MY APPLICATIONS
============================ */
export const getApplications = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user.id });
    if (!studentProfile) return res.status(200).json([]);

    const apps = await Application.find({ student: studentProfile._id }).populate({
      path: "job",
      select: "title company"
    });

    res.status(200).json(apps);
  } catch (err) {
    console.error("GET APPLICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* ============================
    GET JOB APPLICATIONS FOR RECRUITER
============================ */
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const applications = await Application.find({ job: jobId }).populate({
      path: "student",
      select: "name email branch cgpa resume"
    });

    res.status(200).json(applications);
  } catch (err) {
    console.error("GET JOB APPLICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* ============================
    SKILL GAP ANALYSIS
============================ */
export const getSkillGapAnalysis = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const [job, studentProfile] = await Promise.all([
      Job.findById(jobId),
      Student.findOne({ user: req.user.id })
    ]);

    if (!job)
      return res.status(404).json({ message: "Job not found" });

    if (!studentProfile)
      return res.status(400).json({ message: "Complete your profile first" });

    const normalize = (s) => String(s || "").trim().toLowerCase();

    const studentSkills = (studentProfile.skills || []).map(normalize);
    const requiredSkills = job.skillsRequired || [];

    const matchedSkills = requiredSkills.filter((skill) =>
      studentSkills.includes(normalize(skill))
    );

    const missingSkills = requiredSkills.filter(
      (skill) => !studentSkills.includes(normalize(skill))
    );

    const totalRequired = requiredSkills.length;

    let skillScore = 0;

    if (totalRequired > 0) {
      skillScore = (matchedSkills.length / totalRequired) * 60;
    } else {
      skillScore = 60;
    }

    const cgpaScore = (studentProfile.cgpa || 0) >= (job.cgpa || 0) ? 20 : 10;

    const eligibleBranches = (job.branch || []).map(normalize);

    const branchScore =
      eligibleBranches.length === 0 ||
      eligibleBranches.includes(normalize(studentProfile.branch))
        ? 20
        : 5;

    const matchScore = Math.round(skillScore + cgpaScore + branchScore);

    const readiness = getReadinessTier(matchScore);

    res.status(200).json({
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        minCGPA: job.cgpa || 0,
        branches: job.branch || []
      },
      student: {
        skills: studentProfile.skills || [],
        cgpa: studentProfile.cgpa || 0,
        branch: studentProfile.branch || ""
      },
      analysis: {
        matchScore,
        matchedSkills,
        missingSkills,
        readiness,
        cgpaMet: (studentProfile.cgpa || 0) >= (job.cgpa || 0),
        branchEligible: eligibleBranches.length === 0 || eligibleBranches.includes(normalize(studentProfile.branch)),
        totalRequired,
        recommendations: []
      }
    });
  } catch (err) {
    console.error("SKILL GAP ANALYSIS ERROR:", err);
    res.status(500).json({ message: "Failed to compute skill gap analysis" });
  }
};

/* ============================
   GET SKILL GAP ANALYSIS FOR SPECIFIC JOB
*/
export const getSkillGapForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validate job ID format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID format" });
    }

    // Get student profile
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ message: "Complete your profile first" });
    }

    // Check if student has any skills
    if (!student.skills || student.skills.length === 0) {
      return res.status(400).json({ message: "Please add skills to your profile first" });
    }

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Perform skill gap analysis
    const gapAnalysis = getDetailedSkillGap(student, job);

    // Get learning recommendations for missing skills
    const recommendations = getResourcesForSkills(gapAnalysis.missingSkills);

    // Build recommendations object organized by skill
    const recommendationsMap = {};
    recommendations.forEach(rec => {
      recommendationsMap[rec.skill.toLowerCase()] = rec.resources;
    });

    // Format missing skills with their recommendations
    const missingSkillsWithResources = gapAnalysis.missingSkills.map(skill => ({
      skill,
      resources: recommendationsMap[skill] || []
    }));

    res.status(200).json({
      success: true,
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      currentSkills: gapAnalysis.studentCurrentSkills,
      requiredSkills: gapAnalysis.jobRequiredSkills,
      matchedSkills: gapAnalysis.matchedSkills,
      missingSkills: gapAnalysis.missingSkills,
      skillGapMetrics: gapAnalysis.metrics,
      matchPercentage: gapAnalysis.matchPercentage,
      learningRecommendations: missingSkillsWithResources,
      message:
        gapAnalysis.missingSkills.length === 0
          ? "You have all required skills!"
          : `You are missing ${gapAnalysis.missingSkills.length} skill(s). Here are curated resources to help you learn them.`
    });
  } catch (err) {
    console.error("GET SKILL GAP ERROR:", err);
    res.status(500).json({ message: "Failed to analyze skill gap" });
  }
};

/* ============================
   GET PERSONALIZED LEARNING PATHS (ALL APPROVED JOBS)
*/
export const getLearningPaths = async (req, res) => {
  try {
    // Get student profile
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ message: "Complete your profile first" });
    }

    // Check if student has any skills
    if (!student.skills || student.skills.length === 0) {
      return res.status(400).json({ message: "Please add skills to your profile first" });
    }

    // Get all approved jobs
    const approvedJobs = await Job.find({ status: "approved" });

    if (approvedJobs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No jobs available currently",
        totalJobsAnalyzed: 0,
        topMissingSkills: [],
        averageMatchPercentage: 0,
        learningRecommendations: []
      });
    }

    // Perform aggregate skill gap analysis
    const aggregateAnalysis = getAggregateSkillGaps(student, approvedJobs);

    // Get learning resources for top missing skills
    const topMissingSkills = aggregateAnalysis.topMissingSkills.map(
      item => item.skill
    );
    const recommendations = getResourcesForSkills(topMissingSkills);

    // Format recommendations organized by skill
    const recommendationsMap = {};
    recommendations.forEach(rec => {
      recommendationsMap[rec.skill.toLowerCase()] = rec.resources;
    });

    const learningRecommendations = topMissingSkills.map(skill => ({
      skill,
      frequencyInJobs: aggregateAnalysis.topMissingSkills.find(
        item => item.skill === skill
      ).frequencyInJobs,
      resources: recommendationsMap[skill] || []
    }));

    res.status(200).json({
      success: true,
      currentSkills: student.skills,
      totalJobsAnalyzed: aggregateAnalysis.totalJobsAnalyzed,
      averageMatchPercentage: aggregateAnalysis.averageMatchPercentage,
      topMissingSkills: learningRecommendations,
      jobSkillGaps: aggregateAnalysis.jobGaps.map(gap => ({
        jobId: gap.jobId,
        jobTitle: gap.jobTitle,
        company: gap.company,
        missingSkillsCount: gap.missingSkills.length,
        matchPercentage: gap.matchPercentage
      })),
      message: `Based on ${aggregateAnalysis.totalJobsAnalyzed} approved jobs, here are the top skills you should focus on to improve your placement opportunities.`
    });
  } catch (err) {
    console.error("GET LEARNING PATHS ERROR:", err);
    res.status(500).json({ message: "Failed to generate learning paths" });
  }
};


/* ============================
    UPLOAD RESUME & AI PARSE
============================ */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    // Reuse existing resumeParser.js
    const parseResult = await parseResume(req.file);
    if (parseResult.error && !parseResult.text) {
      return res.status(400).json({ message: parseResult.error });
    }

    const resumeText = parseResult.text;
    const aiResult = await analyzeResume(resumeText);

    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = new Student({ user: req.user.id });
    }

    // Auto-Onboarding mapping
    if (aiResult.firstName || aiResult.lastName) {
      student.name = `${aiResult.firstName || ""} ${aiResult.lastName || ""}`.trim();
    }
    if (aiResult.roll) student.roll = aiResult.roll;
    if (aiResult.college) student.college = aiResult.college;
    if (aiResult.branch) student.branch = aiResult.branch;
    if (aiResult.cgpa !== undefined && aiResult.cgpa !== null) {
      student.cgpa = aiResult.cgpa;
    }

    // Store PDF file as base64
    student.resume = `data:application/pdf;base64,${req.file.buffer.toString("base64")}`;

    // Merge skills (unique)
    if (aiResult.skills && aiResult.skills.length > 0) {
      const mergedSkills = new Set([...(student.skills || []), ...aiResult.skills]);
      student.skills = Array.from(mergedSkills);
    }

    // Keep existing aiReadinessScore and aiRoadmap unchanged
    student.aiReadinessScore = aiResult.aiReadinessScore || 0;
    student.aiRoadmap = aiResult.aiRoadmap || [];

    // Store new ATS Resume Dashboard fields
    student.atsScore = aiResult.atsScore || 0;
    student.resumeAnalysis = aiResult.resumeAnalysis || "";
    student.missingSkills = aiResult.missingSkills || [];
    student.improvementSuggestions = aiResult.improvementSuggestions || [];
    student.sectionAnalysis = aiResult.sectionAnalysis || {};

    // Store issue #353 status
    student.resumeParseStatus = parseResult.flagged ? "flagged" : "success";
    if (parseResult.flagged && parseResult.reviewEntry) {
      student.resumeReviewQueue = parseResult.reviewEntry;
    } else {
      student.resumeReviewQueue = { originalName: req.file.originalname, mimeType: req.file.mimetype, reason: "", flaggedAt: null };
    }

    await student.save();

    res.status(200).json({
      message: "Resume parsed and profile updated successfully via AI",
      student: {
        ...student.toObject(),
        firstName: aiResult.firstName || "",
        lastName: aiResult.lastName || ""
      }
    });
  } catch (err) {
    console.error("UPLOAD RESUME ERROR:", err);
    res.status(500).json({
      message: err.message || "Failed to process resume"
    });
  }
};

/* ============================
    GET ATS DASHBOARD DATA
============================ */
export const getAtsDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    if (!student.resume) {
      return res.status(404).json({ message: "No resume uploaded yet. Please upload your resume first." });
    }

    res.status(200).json({
      atsScore: student.atsScore || 0,
      resumeAnalysis: student.resumeAnalysis || "",
      sectionAnalysis: student.sectionAnalysis || {},
      missingSkills: student.missingSkills || [],
      improvementSuggestions: student.improvementSuggestions || [],
      aiRoadmap: student.aiRoadmap || []
    });
  } catch (err) {
    console.error("GET ATS DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error while fetching ATS dashboard data." });
  }
};
