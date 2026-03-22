import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

const hasSmtpConfig = Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    })
  : nodemailer.createTransport({ jsonTransport: true });

export const sendEmail = async ({ to, subject, html, attachments }) => {
  const info = await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    html,
    attachments,
  });

  if (!hasSmtpConfig && env.nodeEnv !== "production") {
    console.log("Email preview (dev json transport):", info.message);
  }

  return info;
};
