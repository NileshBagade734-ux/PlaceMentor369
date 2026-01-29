import Job from "../models/Job.js";
import Application from "../models/application.js";
import mongoose from "mongoose"; 

/* ======================================================
   CREATE JOB
====================================================== */
export const createJob = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("REQ.BODY:", req.body);

    const recruiterId = req.user.id; // ✅ fixed here

    if (!recruiterId) return res.status(400).json({ message: "Recruiter ID missing" });

    const { title, company, description, cgpa, branch, skillsRequired, deadline } = req.body;

    if (!title || !company || !description || !deadline) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const job = await Job.create({
      title,
      company,
      description,
      cgpa,
      branch,
      skillsRequired,
      deadline: new Date(deadline),
      recruiter: recruiterId,
      status: "approved"
    });

    res.status(201).json({ success: true, job });
  } catch (err) {
    console.error("CREATE JOB ERROR:", err);
    res.status(500).json({ message: "Create job failed" });
  }
};



/* ======================================================
   GET RECRUITER JOBS
====================================================== */
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

/* ======================================================
   GET ALL APPLICATIONS (ALL JOBS)
====================================================== */
export const getAllRecruiterApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).select("_id");
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("student", "name branch cgpa resume")
      .populate("job", "title");

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* ======================================================
   UPDATE APPLICATION STATUS
====================================================== */
export const updateApplicantStatus = async (req, res) => {
  try {
    let { applicationId, status } = req.body;
    status = status.toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    if (!["shortlisted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    await application.populate([
      { path: "student", select: "name branch cgpa resume" },
      { path: "job", select: "title" }
    ]);

    res.status(200).json({ success: true, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* ======================================================
   🔥 DASHBOARD STATS (THIS FIXES YOUR ISSUE)
   GET /api/recruiter/dashboard
====================================================== */
export const getRecruiterDashboardStats = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const jobs = await Job.find({ recruiter: recruiterId }).select("_id");
    const jobIds = jobs.map(j => j._id);

    const totalApplicants = await Application.countDocuments({
      job: { $in: jobIds }
    });

    const shortlisted = await Application.countDocuments({
      job: { $in: jobIds },
      status: "shortlisted"
    });

    res.status(200).json({
      jobsPosted: jobIds.length,
      totalApplicants,
      shortlisted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard stats failed" });
  }
};

/* ======================================================
   DELETE JOB
====================================================== */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete job failed" });
  }
};
