import Notification from "../models/notification.js";

/**
 * Dispatch system notifications to users.
 * Handles DB persistence and optional email/socket trigger.
 */
export async function sendNotification({ recipientId, title, message, type = "application_update", actionUrl = "", metadata = {} }) {
  try {
    if (!recipientId || !title || !message) {
      throw new Error("Missing required notification fields");
    }

    const notification = await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      actionUrl,
      metadata
    });

    return notification;
  } catch (error) {
    console.error("Notification Dispatch Error:", error.message);
    return null;
  }
}
