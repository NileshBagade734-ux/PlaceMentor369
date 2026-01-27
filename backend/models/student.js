import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    roll: { type: String, default: "" },
    branch: { type: String, default: "" },
    cgpa: { type: Number, default: 0 },
    college: { type: String, default: "" },
    skills: [{ type: String }],
    resume: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
