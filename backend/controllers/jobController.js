import Job from "../models/User.js";
import Student from "../models/Student.js";

/* ============================
   RECRUITER: CREATE JOB
============================ */
export const createJob = async (req, res) => {
  try {
    const { title, company, location, description, skillsRequired, salary } = req.body;

    if (!title || !company) {
      return res.status(400).json({ message: "Title and Company are required" });
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      skillsRequired,
      salary,
      recruiter: req.user.id
    });

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Job creation failed" });
  }
};

/* ============================
   STUDENT: GET ALL JOBS
============================ */
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .populate("recruiter", "name email"); // recruiter info

    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

/* ============================
   RECRUITER: VIEW APPLICANTS
============================ */
export const getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: "applicants",
        populate: { path: "user", select: "name email" } // populate student basic info
      });

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Ensure only the recruiter who created the job can see applicants
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view applicants" });
    }

    res.json({ job: job.title, applicants: job.applicants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
};
