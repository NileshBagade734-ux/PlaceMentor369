import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "Job Application Deadline",
        "Aptitude Test",
        "Technical Interview",
        "HR Interview",
        "Group Discussion",
        "Coding Round",
        "Offer Letter",
        "Offer Acceptance Deadline",
        "Document Verification",
        "Joining Date"
      ]
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    time: {
      type: String,
      default: "09:00"
    },
    location: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    meetingLink: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      index: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

calendarEventSchema.index({ studentId: 1, date: 1 });
calendarEventSchema.index({ studentId: 1, company: 1 });

calendarEventSchema.virtual("datetimeISO").get(function () {
  const time = this.time || "09:00";
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(this.date);
  value.setHours(hours || 0, minutes || 0, 0, 0);
  return value.toISOString();
});

calendarEventSchema.set("toJSON", { virtuals: true });
calendarEventSchema.set("toObject", { virtuals: true });

export default mongoose.models.CalendarEvent || mongoose.model("CalendarEvent", calendarEventSchema);