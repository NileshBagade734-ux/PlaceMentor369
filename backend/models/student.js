import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  roll: { type: String, default: "" },
  branch: { type: String, default: "" },
  cgpa: { type: Number, default: 0 },
  college: { type: String, default: "" },
  skills: [{ type: String }],
  resume: { type: String },

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
