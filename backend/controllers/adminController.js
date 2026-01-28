import Student from "../models/Student.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

/* ===========================
   DASHBOARD STATS
=========================== */
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const verifiedStudents = await Student.countDocuments({ status: "verified" });
    const pendingStudents = await Student.countDocuments({
  $or: [
    { status: "pending" },
    { status: { $exists: false } } // old records safety
  ]
});


    const activeJobs = await Job.countDocuments({ status: "approved" });
    const pendingJobs = await Job.countDocuments({ status: "pending" });

    const totalApplications = await Application.countDocuments();
    const shortlisted = await Application.countDocuments({ status: "shortlisted" });

    const successRate =
      totalStudents > 0 ? Math.round((shortlisted / totalStudents) * 100) : 0;

    res.status(200).json({
      totalStudents,
      verifiedStudents,
      pendingApprovals: pendingStudents + pendingJobs,
      activeJobs,
      totalApplications,
      shortlisted,
      successRate
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard error", error: err.message });
  }
};

/* ===========================
   STUDENTS
=========================== */

/* GET ALL STUDENTS */
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


/* VERIFY STUDENT */
export const verifyStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status: "verified" },
      { new: true }  // ✅ returns updated document
    );

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json({ message: "Student verified", student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};




/* REJECT STUDENT */
export const rejectStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
/* ===========================
   JOBS
=========================== */
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("recruiter", "company");
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

export const approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    res.status(200).json({ message: "Job approved", job });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
