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

    // Application deadline
    deadline: {
      type: Date,
      required: true
    },

    // Salary range (min-max)
    salary: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 0
      }
    },

    // Location
    location: {
      type: String,
      trim: true
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
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending"
    },

    // Job posting accuracy score
    accuracyScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
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
