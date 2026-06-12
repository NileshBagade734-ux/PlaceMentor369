import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendStatusUpdateEmail = (
  studentEmail,
  studentName,
  jobTitle,
  companyName,
  status
) => {
  const isShortlisted = status === "shortlisted";

  const subject = `Update regarding your application for ${jobTitle} at ${companyName}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;
         margin: auto; padding: 24px; border: 1px solid #e0e0e0;
         border-radius: 8px;">
      <h2 style="color: ${isShortlisted ? "#16a34a" : "#dc2626"};">
        ${isShortlisted ? "Congratulations!" : "Application Update"}
      </h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>
        Your application for <strong>${jobTitle}</strong>
        at <strong>${companyName}</strong> has been updated.
      </p>
      <div style="padding: 16px;
           background: ${isShortlisted ? "#f0fdf4" : "#fff1f2"};
           border-left: 4px solid ${isShortlisted ? "#16a34a" : "#dc2626"};
           margin: 20px 0;">
        <p style="margin: 0; font-size: 16px;">
          Status:
          <strong style="color: ${isShortlisted ? "#16a34a" : "#dc2626"};">
            ${status.toUpperCase()}
          </strong>
        </p>
      </div>
      <p>Best of luck,<br/><strong>PlacementorAI Team</strong></p>
    </div>
  `;

  transporter
    .sendMail({
      from: `"PlacementorAI" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject,
      html: htmlBody,
    })
    .then(() => {
      console.log(`Email sent to ${studentEmail}`);
    })
    .catch((err) => {
      console.error(`Email failed:`, err.message);
    });
};