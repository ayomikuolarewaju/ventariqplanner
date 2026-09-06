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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === "465", // true for port 465, false for 587/others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

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
}