import mongoose from "mongoose";

const mockInterviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    jobRole: {
      type: String,
      required: true,
      trim: true
    },

    company: {
      type: String,
      trim: true
    },

    scheduledDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled"
    },

    feedback: {
      communicationScore: { type: Number, default: 0, min: 0, max: 100 },
      technicalScore: { type: Number, default: 0, min: 0, max: 100 },
      confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
      overallScore: { type: Number, default: 0, min: 0, max: 100 },
      strengths: [String],
      improvements: [String],
      comments: String
    },

    recordingUrl: String,

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewQuestion"
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.models.MockInterview || mongoose.model("MockInterview", mockInterviewSchema);
