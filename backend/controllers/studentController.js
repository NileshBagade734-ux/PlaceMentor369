import mongoose from "mongoose";
import Student from "../models/student.js";
import Job from "../models/job.js";
import Application from "../models/application.js"; // make sure file name matches exactly
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
   UPLOAD RESUME & AI PARSE (Phase 1 & 2)
============================ */
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
