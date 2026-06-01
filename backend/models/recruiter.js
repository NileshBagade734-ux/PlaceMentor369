import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      default: "",
      trim: true
    },
    designation: {
      type: String,
      default: "",
      trim: true
    },
    phone: {
      type: String,
      default: ""
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.Recruiter || mongoose.model("Recruiter", recruiterSchema);
