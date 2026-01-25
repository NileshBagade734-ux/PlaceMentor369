import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Auth user
      required: true
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Shortlisted", "Rejected"],
      default: "Pending"
    },

    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

/* 🔒 Prevent duplicate application (1 student → 1 job) */
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

export default Application;
