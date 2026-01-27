// backend/controllers/recruiterController.js
import Job from "../models/Job.js";
import Application from "../models/application.js";
import Recruiter from "../models/Recruiter.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ===================================================
   RECRUITER REGISTER
=================================================== */
export const registerRecruiter = async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    // Check if email exists
    const existing = await Recruiter.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create recruiter
    const recruiter = await Recruiter.create({
      name,
      email,
      password: hashedPassword,
      company
    });

    // JWT token
    const token = jwt.sign(
      { id: recruiter._id, role: "recruiter" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ recruiter, token });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================================================
   RECRUITER LOGIN
=================================================== */
export const loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, recruiter.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: recruiter._id, role: "recruiter" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ recruiter, token });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================================================
   CREATE / POST JOB
=================================================== */
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      skillsRequired,
      salary,
      cgpa,
      branches,
      deadline,
      location
    } = req.body;

    const recruiter = await Recruiter.findById(req.user.id);
    if (!recruiter)
      return res.status(404).json({ message: "Recruiter not found" });

    const job = await Job.create({
      title,
      company: recruiter.company,
      description,
      skillsRequired: skillsRequired || [],
      salary: salary || "",
      cgpa: cgpa || 0,
      branches: branches || [],
      deadline,
      location: location || "Remote",
      recruiter: req.user.id
    });

    res.status(201).json(job);
  } catch (err) {
    console.error("Create Job Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================================================
   GET RECRUITER'S JOBS
=================================================== */
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).populate({
      path: "applicants",
      populate: { path: "student", select: "name branch cgpa skills" }
    });

    res.status(200).json(jobs);
  } catch (err) {
    console.error("Get Jobs Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================================================
   GET APPLICANTS FOR A JOB
=================================================== */
export const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate({
      path: "applicants",
      populate: { path: "student", select: "name branch cgpa skills" }
    });

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(job.applicants);
  } catch (err) {
    console.error("Get Applicants Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================================================
   DELETE JOB
=================================================== */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.user.id
    });

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Delete Job Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===================================================
   UPDATE APPLICANT STATUS
=================================================== */
export const updateApplicantStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;

    const app = await Application.findById(applicationId);
    if (!app) return res.status(404).json({ message: "Application not found" });

    app.status = status;
    await app.save();

    res.status(200).json({ message: "Status updated", application: app });
  } catch (err) {
    console.error("Update Status Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
