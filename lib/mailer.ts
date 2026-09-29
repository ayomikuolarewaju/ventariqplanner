// lib/mailer.ts
//
// npm install nodemailer
// npm install -D @types/nodemailer
//
// Add to .env (get these from whoever hosts info@stratxct.com's email --
// Google Workspace, Microsoft 365, or your domain's mail provider):
//   SMTP_HOST=smtp.gmail.com          (example for Google Workspace)
//   SMTP_PORT=587
//   SMTP_USER=info@stratxct.com
//   SMTP_PASSWORD=...                  (an app password, not your login password, for most providers)
//   FROM_EMAIL=Ventariq <info@stratxct.com>
//
// If using Google Workspace: you'll need to create an "App Password"
// in the Google Account security settings (regular login passwords
// don't work with SMTP when 2FA is enabled, which it should be).

import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;

const mailConfig =
  smtpHost && smtpPort && smtpUser && smtpPassword
    ? {
        host: smtpHost,
        port: Number(smtpPort || 465),
        secure: smtpPort === "465", // true for port 465, false for 587/others
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      }
    : null;

const transporter = mailConfig ? nodemailer.createTransport(mailConfig) : null;

type Attachment = { filename: string; content: string }; // content = base64 string

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}) {
  if (!transporter) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD before sending planner emails."
    );
  }

  try {
    return transporter.sendMail({
      from: process.env.FROM_EMAIL || "Ventariq <info@stratxct.com>",
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        encoding: "base64" as const,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown SMTP error";
    throw new Error(`Failed to send email to ${to}: ${message}`);
  }
}