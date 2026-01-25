// backend/models/job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String }, // optional
    description: { type: String, required: true },
    skillsRequired: [{ type: String }],
    salary: { type: String },
    cgpa: { type: Number, default: 0 },
    branches: [{ type: String }],
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }],
    deadline: { type: Date, required: true }
  },
  { timestamps: true }
);

// Default export for ES Modules
export default mongoose.models.Job || mongoose.model("Job", jobSchema);
