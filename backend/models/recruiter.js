import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    company: {
      type: String,
      default: "",
    },
    companyDescription: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Recruiter", recruiterSchema);
