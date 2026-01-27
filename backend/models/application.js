import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    // Student who applied
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // role = student
      required: true
    },

    // Job being applied for
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    // Application status
    status: {
      type: String,
      enum: ["Pending", "Shortlisted", "Rejected"],
      default: "Pending"
    },

    // When student applied
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

/* 🔒 Prevent duplicate applications
   (1 student → 1 job only once)
*/
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

// 🔁 Nodemon / hot-reload safe export
export default mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
