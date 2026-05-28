import Job from "../models/job.js";
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

    const updatedApplications = applications.map((application) => ({
      ...application._doc,

      isWithdrawn: application.isWithdrawn,

      withdrawnAt: application.withdrawnAt,

      statusDisplay: application.isWithdrawn
        ? "Withdrawn"
        : application.status,
    }));

    res.status(200).json(updatedApplications);

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
   EXPORT APPLICANTS TO CSV
====================================================== */
export const exportJobApplicantsToCSV = async (req, res) => {
  try {
    const { jobId } = req.query;
    let applications = [];
    let filename = "all-applicants.csv";

    if (jobId) {
      // Verify the job belongs to this recruiter
      const job = await Job.findOne({ _id: jobId, recruiter: req.user.id });
      if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });
      
      applications = await Application.find({ job: jobId })
        .populate("student", "name email branch cgpa skills resume")
        .populate("job", "title");
        
      filename = `applicants-${jobId}.csv`;
    } else {
      // Export all applications for all jobs owned by recruiter
      const jobs = await Job.find({ recruiter: req.user.id }).select("_id");
      const jobIds = jobs.map(j => j._id);
      
      applications = await Application.find({ job: { $in: jobIds } })
        .populate("student", "name email branch cgpa skills resume")
        .populate("job", "title");
    }

    // Define CSV Headers
    const headers = ["Job Title", "Name", "Email", "Branch", "CGPA", "Skills", "Resume Link", "Status", "Applied At"];
    
    // Map application data to CSV rows
    const rows = applications.map(app => {
      const student = app.student || {};
      const job = app.job || {};
      const skills = student.skills ? student.skills.join("; ") : "N/A";
      
      return [
        `"${job.title || "N/A"}"`,
        `"${student.name || "N/A"}"`,
        `"${student.email || "N/A"}"`,
        `"${student.branch || "N/A"}"`,
        student.cgpa || "N/A",
        `"${skills}"`,
        `"${student.resume || "N/A"}"`,
        app.status,
        app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("EXPORT CSV ERROR:", err);
    res.status(500).json({ message: "Failed to export applicants" });
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
