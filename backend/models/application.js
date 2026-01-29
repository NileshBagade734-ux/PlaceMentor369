// backend/models/application.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "verified"],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🔹 Pre-save hook: automatically convert old "verified" status → "shortlisted"
applicationSchema.pre("save", function () {
  if (this.status === "verified") {
    this.status = "shortlisted";
  }
});

// 🔹 Prevent duplicate application per student-job pair
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

// 🔹 Export the model
const Application = mongoose.model("Application", applicationSchema);
export default Application;
