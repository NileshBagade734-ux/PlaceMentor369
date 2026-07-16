import mongoose from "mongoose";

const placementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    company: {
      type: String,
      required: true,
      trim: true
    },

    jobRole: {
      type: String,
      required: true,
      trim: true
    },

    jobType: {
      type: String,
      enum: ["internship", "full-time", "contract"],
      default: "full-time"
    },

    sector: {
      type: String,
      trim: true
    },

    // Salary information
    salary: {
      offered: { type: Number, default: 0 },
      negotiated: { type: Number, default: 0 },
      final: { type: Number, default: 0 },
      currency: { type: String, default: "INR" }
    },

    // Key dates
    offerDate: Date,
    joinDate: Date,
    applicationDate: Date,

    // Placement outcome
    outcome: {
      type: String,
      enum: [
        "placed",
        "offer-received",
        "offer-rejected",
        "rejected-by-company",
        "pursuing-further-studies",
        "not-interested"
      ],
      default: "offer-received"
    },

    // Outcome details
    outcomeNotes: String,
    rejectionReason: String,

    // Verification
    verified: {
      type: Boolean,
      default: false
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    verificationDate: Date,

    // Audit trail
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: mongoose.Schema.Types.ObjectId,
        notes: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for analytics
placementSchema.index({ student: 1, createdAt: 1 });
placementSchema.index({ outcome: 1, createdAt: 1 });
placementSchema.index({ verified: 1, outcome: 1 });

export default mongoose.models.Placement || mongoose.model("Placement", placementSchema);
