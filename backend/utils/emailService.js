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
    throw new Error(`Missing Gmail OAuth env variables: ${missing.join(", ")}`);
  }
};

const createGmailClient = async () => {
  assertEmailEnv();

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  return gmail;
};

const buildRawMessage = ({ to, subject, text }) => {
  const lines = [
    `From: ${process.env.GOOGLE_EMAIL}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    text,
  ];

  return Buffer.from(lines.join("\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const sendEmail = async (to, subject, text) => {
  const gmail = await createGmailClient();
  const raw = buildRawMessage({ to, subject, text });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
};

const sendOtpEmail = async ({ to, otp }) => {
  const text = [
    "Your BuildStack verification code",
    "",
    `OTP: ${otp}`,
    "",
    "This code expires in 5 minutes.",
    "If you didn't request this code, you can ignore this email.",
  ].join("\n");

  await sendEmail(to, "Your BuildStack OTP Code", text);
};

const sendWelcomeEmail = async ({ to }) => {
  const text = [
    "Welcome to BuildStack!",
    "",
    "Your email has been verified successfully.",
    "You can now continue using your account securely.",
  ].join("\n");

  await sendEmail(to, "Welcome to BuildStack", text);
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendWelcomeEmail,
};
