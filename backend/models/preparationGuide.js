import mongoose from "mongoose";

const preparationGuideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: ["behavioral", "technical", "communication", "body-language", "star-method"],
      required: true
    },

    content: {
      type: String,
      required: true
    },

    tips: [String],

    examples: [String],

    keyPoints: [String],

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },

    estimatedReadTime: {
      type: Number,
      default: 5
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.PreparationGuide || mongoose.model("PreparationGuide", preparationGuideSchema);
