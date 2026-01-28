// Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  description: String,
  skillsRequired: [String],
  salary: String,
  cgpa: { type: Number, default: 0 },
  branch: [String],
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default Job;
