import Student from "../models/Student.js";
import Job from "../models/Job.js";
import Application from "../models/application.js";

/* ============================
   GET STUDENT PROFILE
============================ */
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    // Frontend expects empty object if profile not exists
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
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

/* ============================
   APPLY JOB
============================ */
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const exists = await Application.findOne({
      student: req.user.id,
      job: jobId
    });
    if (exists)
      return res.status(400).json({ message: "Already applied" });

    const application = await Application.create({
      student: req.user.id,
      job: jobId
    });

    job.applicants.push(application._id);
    await job.save();

    res.json({
      message: "Application sent successfully",
      application
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to apply" });
  }
};

/* ============================
   GET APPLICATIONS
============================ */
export const getApplications = async (req, res) => {
  try {
    const apps = await Application.find({
      student: req.user.id
    }).populate("job");

    const filtered = apps.filter(a => a.job !== null);
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};
