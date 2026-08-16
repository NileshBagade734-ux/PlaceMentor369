import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    company: { type: String },
    designation: { type: String },
  },
  { timestamps: true }
);

const Recruiter = mongoose.models.Recruiter || mongoose.model("Recruiter", recruiterSchema);
export default Recruiter;