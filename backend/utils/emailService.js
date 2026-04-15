const nodemailer = require("nodemailer");

const MAIL_FROM = process.env.MAIL_FROM || "BuildStack <no-reply@buildstack.app>";

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const hasSmtpConfig =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
    console.warn("SMTP credentials are missing. Using jsonTransport for email previews.");
  }

  return transporter;
};

const sendOtpEmail = async ({ to, name, otp, purpose }) => {
  const subject = purpose === "signup" ? "Verify your BuildStack account" : "Your BuildStack login code";

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111827">
      <h2 style="margin:0 0 16px">Hi ${name || "there"},</h2>
      <p>Use this one-time code to ${purpose === "signup" ? "complete your signup" : "finish your login"}.</p>
      <div style="font-size:30px;font-weight:700;letter-spacing:8px;margin:20px 0;color:#1d4ed8">${otp}</div>
      <p>This code expires in <strong>5 minutes</strong>.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  return getTransporter().sendMail({
    from: MAIL_FROM,
    to,
    subject,
    html,
  });
};

const sendWelcomeEmail = async ({ to, name }) => {
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111827">
      <h2 style="margin:0 0 12px">Welcome to BuildStack, ${name} 👋</h2>
      <p>Your account is now verified and ready for shipping production projects.</p>
      <p>Log in anytime to manage your project portfolio and delivery insights.</p>
    </div>
  `;

  return getTransporter().sendMail({
    from: MAIL_FROM,
    to,
    subject: "Welcome to BuildStack",
    html,
  });
};

module.exports = { sendOtpEmail, sendWelcomeEmail };
