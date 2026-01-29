import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected"], // only these values allowed
      default: "pending"
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

// 🔹 Pre-save hook: handle old "verified" status for backwards compatibility
applicationSchema.pre('save', function(next) {
  if (this.status === "verified") {
    this.status = "shortlisted"; // auto convert old verified → shortlisted
  }
  next();
});

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
