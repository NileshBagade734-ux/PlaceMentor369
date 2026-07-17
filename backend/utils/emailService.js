import nodemailer from "nodemailer";
import { APPLICATION_STATUS } from "../constants/applicationStatus.js";

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
  const isShortlisted = status === APPLICATION_STATUS.SHORTLISTED;

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

  return transporter
    .sendMail({
      from: `"PlacementorAI" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject,
      html: htmlBody,
    });
};

// Send a password reset email containing a one-time reset link.
// @param {string} toEmail  - Recipient email address
// @param {string} toName   - Recipient display name
// @param {string} resetUrl - Full reset URL with raw token as query param
export const sendPasswordResetEmail = (toEmail, toName, resetUrl) => {
  const subject = "Reset your PlacementorAI password";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;
          margin: auto; padding: 24px; border: 1px solid #e0e0e0;
          border-radius: 8px;">
      <h2 style="color: #4f46e5;">Password Reset Request</h2>
      <p>Hi <strong>${toName}</strong>,</p>
      <p>
        We received a request to reset the password for your PlacementorAI account.
        Click the button below to set a new password. This link is valid for
        <strong>1 hour</strong>.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 13px; color: #6b7280;">
        If the button above doesn't work, copy and paste this URL into your browser:<br/>
        <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">
        If you didn't request a password reset, you can safely ignore this email.
        Your password will not be changed.<br/><br/>
        &mdash; <strong>PlacementorAI Team</strong>
      </p>
    </div>
  `;

  return transporter.sendMail({
    from: `"PlacementorAI" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: htmlBody,
  });
};
