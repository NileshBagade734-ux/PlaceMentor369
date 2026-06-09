import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    // Job title
    title: {
      type: String,
      required: true,
      trim: true
    },

    // Company name
    company: {
      type: String,
      required: true,
      trim: true
    },

    // Job description
    description: {
      type: String,
      required: true
    },

    // Minimum CGPA required
    cgpa: {
      type: Number,
      default: 0
    },

    // Eligible branches
    branch: [
      {
        type: String
      }
    ],

    // Skills required
    skillsRequired: [
      {
        type: String,
        trim: true
      }
    ],

    // Location
    location: {
      type: String,
      default: "Remote",
      trim: true
    },

    // Salary / Stipend
    salary: {
      type: String,
      default: "Not Specified",
      trim: true
    },

    // Employment Type (Internship / Full-Time)
    employmentType: {
      type: String,
      enum: ["Internship", "Full-Time"],
      default: "Full-Time"
    },

    // Application deadline
    deadline: {
      type: Date,
      required: true
    },

    // Recruiter reference
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Job approval status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    // Linked applications
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application"
      }
    ]
  },
  {
    timestamps: true
  }
);

// Nodemon / hot-reload safe export
export default mongoose.models.Job || mongoose.model("Job", jobSchema);
