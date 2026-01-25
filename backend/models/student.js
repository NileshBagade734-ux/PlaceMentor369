import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    name: String,
    roll: String,
    branch: String,
    cgpa: Number,
    college: String,

    skills: [String],

    resume: String, // base64 or URL

    appliedJobs: [
      {
        job: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job"
        },
        appliedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

// 🔥 Nodemon / hot reload safe
const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;
