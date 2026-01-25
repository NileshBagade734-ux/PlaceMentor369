import Job from "../models/job.js";
import Application from "../models/Application.js";
import Recruiter from "../models/Recruiter.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ------------------ Recruiter Register ------------------
export const registerRecruiter = async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    const existing = await Recruiter.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const recruiter = await Recruiter.create({ name, email, password: hashed, company });

    const token = jwt.sign({ id: recruiter._id, role: recruiter.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ recruiter, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Recruiter Login ------------------
export const loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, recruiter.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: recruiter._id, role: recruiter.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ recruiter, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Create/Post Job ------------------
export const createJob = async (req, res) => {
  try {
    const { title, description, skillsRequired, salary, cgpa, branches, deadline } = req.body;

    const job = await Job.create({
      title,
      description,
      skillsRequired,
      salary,
      cgpa,
      branches,
      deadline,
      recruiter: req.user.id
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Get Recruiter's Jobs ------------------
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).populate("applicants");
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Get Applicants for a Job ------------------
export const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate({
      path: "applicants",
      populate: { path: "student", select: "name branch cgpa skills" } // nested populate
    });

    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job.applicants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Delete Job ------------------
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------ Update Applicant Status ------------------
export const updateApplicantStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const app = await Application.findById(applicationId);
    if (!app) return res.status(404).json({ message: "Application not found" });

    app.status = status;
    await app.save();

    res.json({ message: "Status updated", application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
