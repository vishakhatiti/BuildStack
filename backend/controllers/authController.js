const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const User = require("../models/User");
const { sendOtpEmail, sendWelcomeEmail } = require("../utils/emailService");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const REQUIRED_GMAIL_ENV_VARS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "GOOGLE_EMAIL",
];

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const assertSendOtpPreconditions = () => {
  const missingEnvVars = REQUIRED_GMAIL_ENV_VARS.filter((name) => !process.env[name]);
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required Gmail env vars: ${missingEnvVars.join(", ")}`);
  }

  if (!Otp || typeof Otp.findOneAndUpdate !== "function") {
    throw new Error("OTP model is not available");
  }

  if (!Otp.db || Otp.db.readyState !== 1) {
    throw new Error("MongoDB is not connected");
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);
    assertSendOtpPreconditions();
    console.log("Sending OTP to:", normalizedEmail);

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 12);

    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otpHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail({ to: normalizedEmail, otp });

    return res.status(200).json({
      message: "OTP sent successfully",
      email: normalizedEmail,
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
    });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const otpRecord = await Otp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired. Please request a new OTP" });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await Otp.deleteOne({ _id: otpRecord._id });

    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!user) {
      const generatedName = normalizedEmail.split("@")[0];
      user = await User.create({
        name: generatedName,
        email: normalizedEmail,
        authProvider: "email",
        isEmailVerified: true,
        lastLoginAt: new Date(),
      });
      isNewUser = true;
    } else {
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    if (isNewUser) {
      await sendWelcomeEmail({ to: normalizedEmail });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

const getMe = async (req, res) => {
  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
};

const oauthSuccess = async (req, res) => {
  const token = signToken(req.user._id);
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const redirectUrl = `${clientUrl}/login?oauth=success&token=${encodeURIComponent(token)}`;
  return res.redirect(redirectUrl);
};

module.exports = {
  sendOtp,
  verifyOtp,
  getMe,
  oauthSuccess,
};
