const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OtpToken = require("../models/OtpToken");
const { sendOtpEmail, sendWelcomeEmail } = require("../utils/emailService");

const OTP_EXPIRY_MS = 5 * 60 * 1000;

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const createOtpRecord = async ({ email, purpose, payload }) => {
  await OtpToken.deleteMany({ email, purpose, consumedAt: null });

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  const otpRecord = await OtpToken.create({
    email,
    purpose,
    otpHash,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    payload,
  });

  return { otpRecord, otp };
};

const requestSignupOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { otpRecord, otp } = await createOtpRecord({
      email: normalizedEmail,
      purpose: "signup",
      payload: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
    });

    await sendOtpEmail({
      to: normalizedEmail,
      name: name.trim(),
      otp,
      purpose: "signup",
    });

    return res.status(200).json({
      message: "OTP sent successfully",
      otpSessionId: otpRecord._id,
      email: normalizedEmail,
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
      purpose: "signup",
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to process signup right now" });
  }
};

const verifySignupOtp = async (req, res) => {
  try {
    const { otpSessionId, otp } = req.body;

    if (!otpSessionId || !otp) {
      return res.status(400).json({ message: "OTP session and code are required" });
    }

    const otpRecord = await OtpToken.findById(otpSessionId);
    if (!otpRecord || otpRecord.purpose !== "signup" || otpRecord.consumedAt) {
      return res.status(400).json({ message: "Invalid OTP session" });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Request a new code." });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ message: "Too many attempts. Request a fresh OTP." });
    }

    const matches = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!matches) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    const existingUser = await User.findOne({ email: otpRecord.email });
    if (existingUser) {
      return res.status(409).json({ message: "Account already exists. Please log in." });
    }

    const createdUser = await User.create({
      name: otpRecord.payload.name,
      email: otpRecord.email,
      password: otpRecord.payload.passwordHash,
      authProvider: "email",
      isEmailVerified: true,
      lastLoginAt: new Date(),
    });

    otpRecord.consumedAt = new Date();
    await otpRecord.save();

    await sendWelcomeEmail({ to: createdUser.email, name: createdUser.name });

    const token = signToken(createdUser._id);

    return res.status(201).json({
      message: "Account verified and created successfully",
      token,
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

const requestLoginOtp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { otpRecord, otp } = await createOtpRecord({
      email: normalizedEmail,
      purpose: "login",
      payload: { userId: user._id },
    });

    await sendOtpEmail({
      to: normalizedEmail,
      name: user.name,
      otp,
      purpose: "login",
    });

    return res.status(200).json({
      message: "Login OTP sent",
      otpSessionId: otpRecord._id,
      email: normalizedEmail,
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
      purpose: "login",
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to process login" });
  }
};

const verifyLoginOtp = async (req, res) => {
  try {
    const { otpSessionId, otp } = req.body;
    if (!otpSessionId || !otp) {
      return res.status(400).json({ message: "OTP session and code are required" });
    }

    const otpRecord = await OtpToken.findById(otpSessionId);
    if (!otpRecord || otpRecord.purpose !== "login" || otpRecord.consumedAt) {
      return res.status(400).json({ message: "Invalid OTP session" });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Request a new code." });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ message: "Too many attempts. Request a fresh OTP." });
    }

    const matches = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!matches) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    const user = await User.findById(otpRecord.payload.userId);
    if (!user) return res.status(404).json({ message: "User no longer exists" });

    otpRecord.consumedAt = new Date();
    await otpRecord.save();

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

const getMe = async (req, res) => {
  res.json({
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
  res.redirect(redirectUrl);
};

module.exports = {
  requestSignupOtp,
  verifySignupOtp,
  requestLoginOtp,
  verifyLoginOtp,
  getMe,
  oauthSuccess,
};
