const { google } = require("googleapis");

const REQUIRED_ENV_VARS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "GOOGLE_EMAIL",
];

const assertEmailEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing Gmail OAuth variables: ${missing.join(", ")}`);
  }
};

const createGmailClient = () => {
  assertEmailEnv();

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  return google.gmail({ version: "v1", auth: oauth2Client });
};

const buildRawMessage = ({ to, subject, text }) => {
  const payload = [
    `From: BuildStack <${process.env.GOOGLE_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    text,
  ].join("\n");

  return Buffer.from(payload)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const sendEmail = async (to, subject, text) => {
  const gmail = createGmailClient();
  const raw = buildRawMessage({ to, subject, text });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
};

const sendOtpEmail = async ({ to, otp }) => {
  await sendEmail(
    to,
    "BuildStack email verification OTP",
    [
      "Your BuildStack email verification code is:",
      "",
      `${otp}`,
      "",
      "This code expires in 5 minutes.",
      "If you did not request this, you can ignore this email.",
    ].join("\n")
  );
};

const sendPasswordResetOtpEmail = async ({ to, otp }) => {
  await sendEmail(
    to,
    "BuildStack password reset OTP",
    [
      "We received a request to reset your BuildStack password.",
      "",
      "Use this OTP:",
      `${otp}`,
      "",
      "This code expires in 5 minutes.",
      "If this wasn't you, please secure your account.",
    ].join("\n")
  );
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendPasswordResetOtpEmail,
};
