import Job from "../models/Job.js";
import Application from "../models/application.js";
import mongoose from "mongoose"; 

/* ======================================================
   CREATE JOB (Recruiter posts a job)
   POST /api/recruiter/jobs
====================================================== */
export const createJob = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    const {
      title,
      company,
      description,
      cgpa,
      branch,
      skillsRequired,
      deadline,
      location,
      salary
    } = req.body;

    if (!title || !company || !description || !deadline) {
      return res.status(400).json({
        message: "Missing required fields",
        missing: { title, company, description, deadline }
      });
    }

    const job = await Job.create({
      title,
      company,
      description,
      cgpa,
      branch,
      skillsRequired,
      deadline,
      recruiter: recruiterId,
      status: "approved" // auto-approve for now
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job
    });
  } catch (err) {
    console.error("Create Job Error:", err);
    res.status(500).json({ message: "Server error while creating job" });
  }
};

/* ======================================================
   GET RECRUITER JOBS
   GET /api/recruiter/jobs
====================================================== */
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .populate("applicants"); // ✅ applicants ko populate karo
    res.json(jobs);
  } catch (err) {
    console.error("FETCH JOBS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

/* ======================================================
   GET JOB APPLICANTS
   GET /api/recruiter/jobs/:id/applicants
====================================================== */
export const getJobApplicants = async (req, res) => {
  try {
    const { id: jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    const applications = await Application.find({ job: jobId })
      .populate({
        path: "student",
        select: "name roll branch cgpa resume"
      })
      .populate({
        path: "job",
        select: "title"
      });

    console.log("Applications fetched:", applications);

    res.status(200).json(applications);
  } catch (err) {
    console.error("Get applicants error:", err);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
};

/* ======================================================
   UPDATE APPLICATION STATUS
   PATCH /api/recruiter/applications/status
====================================================== */
export const updateApplicantStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;

    if (!applicationId || !status) {
      return res.status(400).json({ message: "Application ID and status required" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

   if (!["shortlisted", "rejected"].includes(status)) {
  return res.status(400).json({ message: "Invalid status" });
}

    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await application.save();

    // ✅ Populate student & job for frontend
    const populatedApp = await application.populate({
      path: "student",
      select: "name email branch cgpa resume"
    }).populate({
      path: "job",
      select: "title"
    });

    res.status(200).json({ success: true, message: `Application ${status}`, application: populatedApp });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* ======================================================
   DELETE JOB
   DELETE /api/recruiter/jobs/:id
====================================================== */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete job" });
  }
};
