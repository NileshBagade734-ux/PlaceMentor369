import Job from "../models/job.js";
import Application from "../models/application.js";
import { validateJobPosting, checkJobExpiry, addFeedback, logAuditEntry } from "../utils/jobValidator.js";

/* CREATE JOB */
export const createJob = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { title, company, description, cgpa, branch, skillsRequired, deadline, location, salaryMin, salaryMax } = req.body;

    if (!title || !company || !description || !deadline) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate job posting
    const validation = validateJobPosting({
      title,
      company,
      description,
      cgpa,
      skillsRequired,
      deadline,
      salaryMin,
      salaryMax
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Job validation failed",
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    const job = await Job.create({
      title,
      company,
      description,
      cgpa,
      branch: branch || [],
      skillsRequired: skillsRequired || [],
      deadline,
      location,
      salaryMin,
      salaryMax,
      recruiter: recruiterId,
      status: "approved",
      validationStatus: validation.validationStatus,
      isCompanyVerified: false,
      skillsLastVerified: new Date(),
      feedback: [],
      auditLog: [{
        action: "created",
        changedBy: recruiterId,
        timestamp: new Date()
      }]
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      warnings: validation.warnings,
      job
    });
  } catch (err) {
    console.error("Create Job Error:", err);
    res.status(500).json({ message: "Server error while creating job" });
  }
};

/* GET RECRUITER JOBS */
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recruiter jobs" });
  }
};

/* GET JOB APPLICANTS */
export const getJobApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;

    const applications = await Application.find({ job: jobId })
      .populate("student", "name email cgpa branch resume") // 🔥 fixed populate
      .populate("job", "title company");

    res.status(200).json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
};

/* UPDATE APPLICATION STATUS */
export const updateApplicantStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    if (!["Shortlisted", "Rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await application.save();

    res.status(200).json({ success: true, message: `Application ${status}`, application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* DELETE JOB */
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

/* REPORT JOB POSTING ISSUE */
export const reportJobIssue = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { issue, message } = req.body;
    const studentId = req.user._id;

    if (!["outdated-skills", "salary-mismatch", "position-filled", "incorrect-deadline"].includes(issue)) {
      return res.status(400).json({ message: "Invalid issue type" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    addFeedback(job, studentId, issue, message);
    await job.save();

    res.status(200).json({
      success: true,
      message: "Issue reported successfully",
      companyAccuracyScore: job.companyAccuracyScore,
      feedbackCount: job.feedback.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to report issue" });
  }
};

/* GET COMPANY ACCURACY REPORT */
export const getCompanyAccuracy = async (req, res) => {
  try {
    const { companyName } = req.params;

    const jobs = await Job.find({ company: companyName });
    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found for this company" });
    }

    const avgAccuracy = jobs.reduce((sum, job) => sum + job.companyAccuracyScore, 0) / jobs.length;
    const totalFeedback = jobs.reduce((sum, job) => sum + job.feedback.length, 0);
    const expiredJobs = jobs.filter(j => j.status === "expired").length;
    const flaggedJobs = jobs.filter(j => j.validationStatus === "flagged").length;

    res.status(200).json({
      company: companyName,
      totalJobPostings: jobs.length,
      averageAccuracyScore: avgAccuracy.toFixed(2),
      totalReports: totalFeedback,
      expiredPostings: expiredJobs,
      flaggedPostings: flaggedJobs,
      jobs: jobs.map(j => ({
        id: j._id,
        title: j.title,
        status: j.status,
        validationStatus: j.validationStatus,
        accuracyScore: j.companyAccuracyScore,
        feedbackCount: j.feedback.length
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch company accuracy report" });
  }
};

/* CHECK AND EXPIRE OUTDATED JOBS */
export const expireOutdatedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: { $ne: "expired" }, deadline: { $lt: new Date() } });
    let expiredCount = 0;

    for (const job of jobs) {
      if (await checkJobExpiry(job)) {
        logAuditEntry(job, "auto-expired", req.user?._id, job.status, "expired");
        await job.save();
        expiredCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `${expiredCount} jobs expired successfully`,
      expiredCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to expire jobs" });
  }
};
