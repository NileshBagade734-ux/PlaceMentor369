import mongoose from "mongoose";
import { APPLICATION_STATUS } from "../constants/applicationStatus.js";

const VALID_STATUSES = [...Object.values(APPLICATION_STATUS), "verified"];

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
      enum: VALID_STATUSES,
      default: APPLICATION_STATUS.APPLIED,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

applicationSchema.pre("save", function () {
  if (typeof this.status === "string") {
    this.status = this.status.toLowerCase();
  }
  if (this.status === "verified") {
    this.status = APPLICATION_STATUS.SHORTLISTED;
  }
});

// 🔹 Prevent duplicate application per student-job pair
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

// 🔹 Export the model
const Application = mongoose.model("Application", applicationSchema);
export default Application;
