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

    // Salary range (added for validation)
    salaryMin: {
      type: Number,
      default: 0
    },

    salaryMax: {
      type: Number,
      default: 0
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

    // Validation status (new)
    validationStatus: {
      type: String,
      enum: ["unverified", "verified", "flagged"],
      default: "unverified"
    },

    // Company verification flag
    isCompanyVerified: {
      type: Boolean,
      default: false
    },

    // Skills currency check (array of timestamps for last verification)
    skillsLastVerified: {
      type: Date,
      default: null
    },

    // Company feedback/issues tracker
    feedback: [
      {
        studentId: mongoose.Schema.Types.ObjectId,
        issue: {
          type: String,
          enum: ["outdated-skills", "salary-mismatch", "position-filled", "incorrect-deadline"]
        },
        message: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // Company accuracy score (0-100)
    companyAccuracyScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },

    // Audit trail
    auditLog: [
      {
        action: String,
        changedBy: mongoose.Schema.Types.ObjectId,
        previousValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now }
      }
    ],

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

// Auto-expire jobs past deadline
jobSchema.pre("find", function () {
  this.where({ deadline: { $lt: new Date() }, status: { $ne: "expired" } } );
});

jobSchema.pre("findOne", function () {
  this.where({ deadline: { $lt: new Date() }, status: { $ne: "expired" } } );
});

// Nodemon / hot-reload safe export
export default mongoose.models.Job || mongoose.model("Job", jobSchema);
