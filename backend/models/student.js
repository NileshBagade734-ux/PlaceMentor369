import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  roll: { type: String, default: "" },
  branch: { type: String, default: "" },
  cgpa: { type: Number, default: 0 },
  college: { type: String, default: "" },
  skills: [{ type: String }],
  resume: { type: String },
  aiReadinessScore: { type: Number, default: 0 },
  aiRoadmap: [{ type: String }],

  // ATS Resume Analysis Fields
  atsScore: { type: Number, default: 0 },
  resumeAnalysis: { type: String, default: "" },
  missingSkills: [{ type: String }],
  improvementSuggestions: [{ type: String }],
  sectionAnalysis: {
    contactInformation: {
      status: { type: String, enum: ["Present", "Weak", "Missing"], default: "Missing" },
      suggestions: { type: String, default: "" }
    },
    education: {
      status: { type: String, enum: ["Present", "Weak", "Missing"], default: "Missing" },
      suggestions: { type: String, default: "" }
    },
    skills: {
      status: { type: String, enum: ["Present", "Weak", "Missing"], default: "Missing" },
      suggestions: { type: String, default: "" }
    },
    projects: {
      status: { type: String, enum: ["Present", "Weak", "Missing"], default: "Missing" },
      suggestions: { type: String, default: "" }
    },
    experience: {
      status: { type: String, enum: ["Present", "Weak", "Missing"], default: "Missing" },
      suggestions: { type: String, default: "" }
    },
    achievements: {
      status: { type: String, enum: ["Present", "Weak", "Missing"], default: "Missing" },
      suggestions: { type: String, default: "" }
    },
    certifications: {
      status: { type: String, enum: ["Present", "Weak", "Missing"], default: "Missing" },
      suggestions: { type: String, default: "" }
    }
  },

  // ── Issue #353: resume parse status & fallback review queue ──────────────
  resumeParseStatus: {
    type: String,
    enum: ["success", "flagged", "pending"],
    default: "pending",
  },
  resumeReviewQueue: {
    originalName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    reason: { type: String, default: "" },
    flaggedAt: { type: Date },
  },

  // 🔥 ADD THIS
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  },

  // 🔥 IMPORTANT: prevent duplicate student profiles
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  }

}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
