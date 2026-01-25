import Job from "../models/job.js";
import Student from "../models/Student.js";
import Application from "../models/application.js";

/* ============================
   JOB CRUD
============================ */

// Create a new job
export const createJob = async (req, res) => {
  try {
    const { title, company, cgpa, branches, skillsRequired, description, deadline } = req.body;
    const job = await Job.create({ title, company, cgpa, branches, skillsRequired, description, deadline });
    res.status(201).json({ message: "Job created", job });
  } catch (err) {
    console.error("createJob Error:", err.message);
    res.status(500).json({ message: "Failed to create job" });
  }
};

// Get all jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("getJobs Error:", err.message);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    Object.assign(job, req.body);
    await job.save();
    res.json({ message: "Job updated", job });
  } catch (err) {
    console.error("updateJob Error:", err.message);
    res.status(500).json({ message: "Failed to update job" });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error("deleteJob Error:", err.message);
    res.status(500).json({ message: "Failed to delete job" });
  }
};

/* ============================
   STUDENT VERIFICATION
============================ */
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("user", "name email role");
    res.json(students);
  } catch (err) {
    console.error("getStudents Error:", err.message);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

// Verify a student
export const verifyStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.verified = true;
    await student.save();
    res.json({ message: "Student verified", student });
  } catch (err) {
    console.error("verifyStudent Error:", err.message);
    res.status(500).json({ message: "Failed to verify student" });
  }
};

/* ============================
   VIEW ALL APPLICATIONS
============================ */
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("student", "name email")
      .populate("job", "title company");
    res.json(applications);
  } catch (err) {
    console.error("getAllApplications Error:", err.message);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};
