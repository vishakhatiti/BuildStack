const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const User = require("../models/User");
const { sendOtpEmail, sendPasswordResetOtpEmail } = require("../utils/emailService");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const PASSWORD_MIN_LENGTH = 8;

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  provider: user.provider,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

const persistOtp = async ({ email, purpose, otp }) => {
  const otpHash = await bcrypt.hash(otp, 12);
  await Otp.findOneAndUpdate(
    { email, purpose },
    {
      email,
      purpose,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const sendOtpWithResponseHandling = async ({ res, email, otp, failureMessage }) => {
  console.log("Sending OTP to:", email);

  try {
    await sendOtpEmail({ to: email, otp });
    console.log("OTP email sent");
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Email failed:", error);
    res.status(500).json({
      message: failureMessage || "Failed to send OTP email",
      error: error.message,
    });
    return false;
  }
};

const issueOtpForPurpose = async ({ email, purpose, allowUnverifiedForRegister = false }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    return { user: null, email: normalizedEmail, sent: false };
  }

  if (user.provider !== "local") {
    throw new Error(`This account uses ${user.provider} OAuth. Continue with OAuth instead.`);
  }

  if (purpose === "login" && !user.isVerified) {
    throw new Error("Email is not verified. Please complete signup OTP verification first.");
  }

  if (purpose === "register" && !allowUnverifiedForRegister && user.isVerified) {
    throw new Error("An account with this email already exists");
  }

  const otp = generateOtp();
  await persistOtp({ email: normalizedEmail, purpose, otp });
  console.log("Sending OTP to:", normalizedEmail);
  await sendOtpEmail({ to: normalizedEmail, otp });
  console.log("OTP email sent");

  return { user, email: normalizedEmail, sent: true };
};

const register = async (req, res) => {
  try {
    console.log("Register body:", req.body);
    const { name, email, password } = req.body;

    if (!name?.trim() || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).select("+password");
    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingUser && existingUser.provider !== "local") {
      return res.status(400).json({
        message: `This email is registered with ${existingUser.provider}. Continue with OAuth instead.`,
      });
    }

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    if (existingUser) {
      existingUser.name = name.trim();
      existingUser.password = hashedPassword;
      existingUser.isVerified = false;
      await existingUser.save();
    } else {
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        provider: "local",
        isVerified: false,
      });
    }

    const otp = generateOtp();
    await persistOtp({ email: normalizedEmail, purpose: "register", otp });

    const emailSent = await sendOtpWithResponseHandling({
      res,
      email: normalizedEmail,
      otp,
      failureMessage: "Failed to send OTP email",
    });
    if (!emailSent) {
      return;
    }

    return res.status(200).json({
      message: "OTP sent",
      email: normalizedEmail,
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
    });
  } catch (error) {
    console.error("register error", error);
    return res.status(500).json({ message: "Unable to register. Please try again." });
  }
};

const verifyOtp = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    let otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "register" });
    let purpose = "register";

    if (!otpRecord) {
      otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "login" });
      purpose = "login";
    }

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired. Please request a new code" });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.provider !== "local") {
      return res.status(404).json({ message: "Account not found for OTP verification" });
    }

    if (purpose === "register") {
      user.isVerified = true;
    }
    await user.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    const token = signToken(user._id);

    return res.status(200).json({
      message: purpose === "register" ? "OTP verified successfully" : "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("verifyOtp error", error);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

const sendOtp = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const { user } = await issueOtpForPurpose({ email, purpose: "login" });
    if (!user) {
      return res.status(404).json({ message: "No account found for this email" });
    }

    return res.status(200).json({
      message: "OTP sent successfully",
      email: normalizeEmail(email),
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
    });
  } catch (error) {
    console.error("sendOtp error", error);
    return res.status(400).json({ message: error.message || "Unable to send OTP" });
  }
};

const login = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.provider !== "local") {
      return res.status(400).json({
        message: `This account uses ${user.provider} OAuth. Continue with OAuth instead.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email is not verified. Please complete OTP verification.",
      });
    }

    const token = signToken(user._id);
    return res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("login error", error);
    return res.status(500).json({ message: "Unable to login. Please try again." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (user && user.provider === "local") {
      const otp = generateOtp();
      await persistOtp({ email: normalizedEmail, purpose: "reset", otp });
      console.log("Sending OTP to:", normalizedEmail);
      try {
        await sendPasswordResetOtpEmail({ to: normalizedEmail, otp });
        console.log("OTP email sent");
      } catch (emailError) {
        console.error("Email failed:", emailError);
        return res.status(500).json({
          message: "Failed to send OTP email",
          error: emailError.message,
        });
      }
    }

    return res.status(200).json({
      message: "If an account exists, a password reset OTP has been sent.",
      email: normalizedEmail,
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
    });
  } catch (error) {
    console.error("forgotPassword error", error);
    return res.status(500).json({ message: "Unable to process request." });
  }
};

const resetPassword = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and newPassword are required" });
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = normalizeEmail(email);
    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "reset" });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired. Please request a new code" });
    }

    const isOtpMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isOtpMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user || user.provider !== "local") {
      return res.status(404).json({ message: "Local account not found for this email" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.isVerified = true;
    await user.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("resetPassword error", error);
    return res.status(500).json({ message: "Unable to reset password" });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({ user: sanitizeUser(req.user) });
};

const oauthSuccess = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "OAuth authentication failed" });
  }

  const token = signToken(req.user._id);
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    return res.status(500).json({ message: "FRONTEND_URL is not configured" });
  }

  return res.redirect(`${frontendUrl}/auth/success?token=${encodeURIComponent(token)}`);
};

module.exports = {
  register,
  sendOtp,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  oauthSuccess,
};
