import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: ["technical", "behavioral", "situational", "company-specific"],
      required: true
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },

    jobRole: {
      type: String,
      trim: true
    },

    company: {
      type: String,
      trim: true
    },

    hints: [String],

    expectedKeyPoints: [String],

    sampleAnswer: String
  },
  {
    timestamps: true
  }
);

export default mongoose.models.InterviewQuestion || mongoose.model("InterviewQuestion", interviewQuestionSchema);
