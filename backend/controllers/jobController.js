import Job from "../models/Job.js";
import Application from "../models/application.js";

/* CREATE JOB */
export const createJob = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { title, company, description, cgpa, branch, skillsRequired, deadline, location, salary } = req.body;

    if (!title || !company || !description || !deadline) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const job = await Job.create({
      title,
      company,
      description,
      cgpa,
      branches: branch, // ✅ fixed typo
      skillsRequired,
      deadline,
      location,
      salary,
      recruiter: recruiterId,
      status: "approved" // auto-approve
    });

    res.status(201).json({ success: true, message: "Job posted successfully", job });
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
