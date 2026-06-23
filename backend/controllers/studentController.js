import mongoose from "mongoose";
import Student from "../models/student.js";
import Job from "../models/job.js";
import Application from "../models/application.js"; // make sure file name matches exactly
import {
  getDetailedSkillGap,
  getAggregateSkillGaps
} from "../utils/skillGapAnalysis.js";

import { getResourcesForSkills } from "../utils/learningResources.js";

import { analyzeResume } from "../utils/gemini.js";
import { PDFParse } from "pdf-parse";

/* ============================
   GET STUDENT PROFILE
============================ */
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    res.status(200).json(student || {});
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================
   SAVE/UPDATE STUDENT PROFILE
============================ */
export const saveProfile = async (req, res) => {
  try {
    const { name, roll, branch, cgpa, college, skills, resume } = req.body;

    let student = await Student.findOne({ user: req.user.id });
    if (!student) student = new Student({ user: req.user.id });

    student.name = name || "";
    student.roll = roll || "";
    student.branch = branch || "";
    student.cgpa = cgpa || 0;
    student.college = college || "";
    student.skills = skills || [];
    student.resume = resume || "";

    await student.save();
    res.status(200).json({ message: "Profile saved successfully", student });
  } catch (err) {
    console.error("SAVE PROFILE ERROR:", err);
    res.status(500).json({ message: "Save failed" });
  }
};

/* ============================
   GET ALL APPROVED JOBS
============================ */
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "approved" });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

/* ============================
   APPLY FOR JOB
============================ */
export const applyJob = async (req, res) => {
  try {
    console.log("🆔 req.user:", req.user);
    console.log("🆔 req.params.jobId:", req.params.jobId);

    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const job = await Job.findById(jobId);
    console.log("🧰 job found:", job);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const studentProfile = await Student.findOne({ user: req.user.id });
    console.log("🧰 studentProfile found:", studentProfile);
    if (!studentProfile) {
      return res.status(400).json({ message: "Complete your profile first" });
    }

    // ✅ Check if already applied
    const exists = await Application.findOne({
      student: studentProfile._id,
      job: jobId
    });
    console.log("🧰 existing application:", exists);
    if (exists) return res.status(400).json({ message: "Already applied" });

    // ✅ Create new application
    const application = await Application.create({
      student: studentProfile._id,
      job: jobId
    });
    console.log("🧰 application created:", application);

    // ⚡ UPDATE JOB DOCUMENT: push application ID
   

    res.status(201).json({
      success: true,
      message: "Application sent successfully",
      application
    });

  } catch (err) {
    console.error("🔥 APPLY JOB ERROR:", err);
    res.status(500).json({ message: "Failed to apply" });
  }
};

/* ============================
   GET STUDENT APPLICATIONS
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
   GET SKILL GAP ANALYSIS FOR SPECIFIC JOB
   ============================*/
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
============================ */
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
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    // 1. Extract text from PDF
    const parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    const resumeText = result.text;

    // 2. Call Gemini AI
    const aiResult = await analyzeResume(resumeText);

    // 3. Update Student Profile
    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = new Student({ user: req.user.id });
    }

    // Auto-Onboarding
    if (aiResult.firstName || aiResult.lastName) {
      student.name = `${aiResult.firstName || ""} ${aiResult.lastName || ""}`.trim();
    }
    if (aiResult.roll) student.roll = aiResult.roll;
    if (aiResult.college) student.college = aiResult.college;
    if (aiResult.branch) student.branch = aiResult.branch;
    if (aiResult.cgpa !== undefined && aiResult.cgpa !== null) student.cgpa = aiResult.cgpa;
    
    // Direct persistence of the uploaded PDF file as base64
    student.resume = `data:application/pdf;base64,${req.file.buffer.toString("base64")}`;
    
    // Merge skills (unique)
    if (aiResult.skills && aiResult.skills.length > 0) {
       const mergedSkills = new Set([...student.skills, ...aiResult.skills]);
       student.skills = Array.from(mergedSkills);
    }

    student.aiReadinessScore = aiResult.aiReadinessScore || 0;
    student.aiRoadmap = aiResult.aiRoadmap || [];

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
    res.status(500).json({ message: err.message || "Failed to process resume" });
  }
};
