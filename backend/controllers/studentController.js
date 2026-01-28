import Student from "../models/Student.js";
import Job from "../models/Job.js";
import Application from "../models/application.js";

/* GET STUDENT PROFILE */
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    res.json(student || {});
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* SAVE PROFILE */
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

/* GET JOBS */
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "approved" });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

/* APPLY JOB */
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // ✅ Find student profile
    const studentProfile = await Student.findOne({ user: req.user.id });
    if (!studentProfile)
      return res.status(400).json({ message: "Complete your profile first" });

    // 🔒 Prevent duplicate
    const exists = await Application.findOne({
      student: studentProfile._id,
      job: jobId
    });
    if (exists)
      return res.status(400).json({ message: "Already applied" });

    // ✅ Correct application reference
    const application = await Application.create({
      student: studentProfile._id,
      job: jobId
    });

    // Push to job applicants array
    job.applicants.push(application._id);
    await job.save();

    res.status(201).json({ message: "Application sent successfully", application });
  } catch (err) {
    console.error("APPLY JOB ERROR:", err);
    res.status(500).json({ message: "Failed to apply" });
  }
};

/* GET STUDENT APPLICATIONS */
export const getApplications = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user.id });

    if (!studentProfile)
      return res.status(400).json({ message: "Profile not found" });

    const apps = await Application.find({ student: studentProfile._id })
      .populate({
        path: "job",
        select: "title company"
      });

    res.status(200).json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* GET JOB APPLICATIONS FOR RECRUITER */
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ job: jobId }).populate({
      path: "student",
      select: "name email branch cgpa resume"
    });

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};
