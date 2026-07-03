// backend/models/application.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "rejected",
        "verified",
        "offer-extended",
        "offer-accepted",
        "offer-rejected",
        "offer-negotiating",
        "rejected-by-company",
        "placed",
        "pursuing-further-studies"
      ],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },

    // ── Placement outcome details (Issue #354) ──────────────────
    outcomeType: {
      type: String,
      enum: ["internship", "permanent", "ppo", null],
      default: null
    },

    offerDetails: {
      role: { type: String, default: "" },
      offeredSalary: { type: Number, default: 0 },
      negotiatedSalary: { type: Number, default: null },
      startDate: { type: Date, default: null },
      sector: { type: String, default: "" }
    },

    // Employer confirmation required before counting toward placement stats
    employerConfirmed: {
      type: Boolean,
      default: false
    },

    // Full journey audit trail: every status change is recorded
    statusHistory: [
      {
        fromStatus: String,
        toStatus: String,
        changedBy: mongoose.Schema.Types.ObjectId,
        timestamp: { type: Date, default: Date.now },
        note: String
      }
    ],

    placementConfirmedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// 🔹 Pre-save hook: automatically convert old "verified" status → "shortlisted"
applicationSchema.pre("save", function () {
  if (this.status === "verified") {
    this.status = "shortlisted";
  }
});

// 🔹 Prevent duplicate application per student-job pair
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

// 🔹 Track a status transition with full audit context
applicationSchema.methods.recordStatusChange = function (newStatus, changedBy, note = "") {
  this.statusHistory.push({
    fromStatus: this.status,
    toStatus: newStatus,
    changedBy,
    timestamp: new Date(),
    note
  });
  this.status = newStatus;

  if (newStatus === "placed") {
    this.placementConfirmedAt = new Date();
  }

  return this;
};

// 🔹 Export the model
const Application = mongoose.model("Application", applicationSchema);
export default Application;
