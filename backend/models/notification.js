import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["application_update", "job_approval", "ats_alert", "system_announcement"],
      default: "application_update"
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    metadata: {
      type: Map,
      of: String
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
