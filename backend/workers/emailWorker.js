import { Worker } from "bullmq";
import connection from "../config/redis.js";
import { sendStatusUpdateEmail } from "../utils/emailService.js";

if (!connection) {
  console.warn("⚠️ Redis connection is missing. Email Worker will not start.");
} else {
  console.log("👷 Starting BullMQ Worker: email-queue");

  const emailWorker = new Worker(
    "email-queue",
    async (job) => {
      const { studentEmail, studentName, jobTitle, companyName, status } = job.data;
      console.log(`[Job ${job.id}] Sending ${status} email to ${studentEmail}`);

      try {
        await sendStatusUpdateEmail(studentEmail, studentName, jobTitle, companyName, status);
        return { success: true };
      } catch (error) {
        console.error(`[Job ${job.id}] Failed to send email:`, error.message);
        throw error;
      }
    },
    { connection }
  );

  emailWorker.on("completed", (job) => {
    console.log(`✅ [Job ${job.id}] Email sent successfully!`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`❌ [Job ${job.id}] Email sending failed with ${err.message}`);
  });
}
