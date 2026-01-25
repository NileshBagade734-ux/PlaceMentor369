// backend/controllers/studentController.js
import Student from "../models/Student.js";
import Job from "../models/job.js";
import Application from "../models/application.js";

/* ============================
   GET STUDENT PROFILE
============================ */
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    res.status(200).json(student || {});
  } catch (err) {
    console.error("getProfile Error:", err.message);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

/* ============================
   CREATE / UPDATE PROFILE
============================ */
export const updateProfile = async (req, res) => {
  try {
    const { name, roll, branch, cgpa, college, skills, resume } = req.body;

    let student = await Student.findOne({ user: req.user.id });
    if (!student) student = new Student({ user: req.user.id });

    Object.assign(student, {
      name,
      roll,
      branch,
      cgpa,
      college,
      skills,
      resume
    });

    await student.save();
    res.status(200).json({ message: "Profile saved successfully" });
  } catch (err) {
    console.error("updateProfile Error:", err.message);
    res.status(500).json({ message: "Profile save failed" });
  }
};

/* ============================
   GET AVAILABLE JOBS
============================ */
export const getStudentJobs = async (req, res) => {
  try {
    const jobs = await Job.find();

    const formattedJobs = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      company: job.company,
      cgpa: job.cgpa || 0,
      branches: job.branches || [],
      deadline: job.deadline || "Open",
      description: job.description,
      skills: job.skillsRequired || [] // frontend expects `skills`
    }));

    res.status(200).json(formattedJobs);
  } catch (err) {
    console.error("getStudentJobs Error:", err.message);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

/* ============================
   APPLY FOR JOB
============================ */
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validate Mongo ObjectId
    if (!jobId.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ message: "Invalid job ID" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    // Check duplicate application
    const existingApplication = await Application.findOne({ student: student._id, job: jobId });
    if (existingApplication)
      return res.status(400).json({ message: "You have already applied for this job" });

    // Create application
    const application = await Application.create({
      student: student._id,
      job: jobId
    });

    res.status(201).json({
      message: `Applied successfully to ${job.title} at ${job.company}`,
      application
    });
  } catch (err) {
    console.error("applyJob Error:", err.message);
    res.status(500).json({ message: "Server error during application" });
  }
};

/* ============================
   GET MY APPLICATIONS
============================ */
export const getAppliedJobs = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(200).json([]);

    const applications = await Application.find({ student: student._id })
      .populate("job", "title company deadline skills")
      .sort({ createdAt: -1 }); // Latest first

    res.status(200).json(applications);
  } catch (err) {
    console.error("getAppliedJobs Error:", err.message);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};
