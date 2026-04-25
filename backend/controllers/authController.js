const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const User = require("../models/User");
const { sendOtpEmail, sendPasswordResetOtpEmail } = require("../utils/emailService");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const PASSWORD_MIN_LENGTH = 6;

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sendSuccess = (res, message, data = {}) =>
  res.status(200).json({
    success: true,
    message,
    data,
  });

const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({
    success: false,
    message,
  });

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const buildAuthData = (user) => ({
  token: signToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
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

const validateOtpRecord = async ({ otpRecord, otp }) => {
  if (!otpRecord) {
    return { valid: false, message: "Invalid or expired OTP" };
  }

  if (otpRecord.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ _id: otpRecord._id });
    return { valid: false, message: "OTP expired. Please request a new code" };
  }

  const isOtpMatch = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isOtpMatch) {
    return { valid: false, message: "Invalid OTP" };
  }

  return { valid: true };
};

const issueOtpForPurpose = async ({ email, purpose }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    return { user: null, email: normalizedEmail };
  }

  if (user.provider !== "local") {
    return {
      error: `This account uses ${user.provider} OAuth. Continue with OAuth instead.`,
      statusCode: 400,
    };
  }

  if (purpose === "login" && !user.isVerified) {
    return {
      error: "Email is not verified. Please complete signup OTP verification first.",
      statusCode: 401,
    };
  }

  const otp = generateOtp();
  await persistOtp({ email: normalizedEmail, purpose, otp });

  if (purpose === "reset") {
    await sendPasswordResetOtpEmail({ to: normalizedEmail, otp });
  } else {
    await sendOtpEmail({ to: normalizedEmail, otp });
  }

  return { user, email: normalizedEmail };
};

const register = async (req, res) => {
  try {
    console.log("Request:", req.body);
    const { name, email, password } = req.body;

    if (!name?.trim()) {
      return sendError(res, 400, "Name is required");
    }

    if (!email || !isValidEmail(normalizeEmail(email))) {
      return sendError(res, 400, "Please enter a valid email address");
    }

    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail }).select("+password");

    if (existingUser && existingUser.provider !== "local") {
      return sendError(
        res,
        400,
        `This email is registered with ${existingUser.provider}. Continue with OAuth instead.`
      );
    }

    if (existingUser && existingUser.isVerified) {
      return sendError(res, 400, "An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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
    await sendOtpEmail({ to: normalizedEmail, otp });

    return sendSuccess(res, "OTP sent successfully", {
      email: normalizedEmail,
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.message === "Email sending failed") {
      return sendError(res, 500, "Email sending failed");
    }
    return sendError(res, 500, "Server error");
  }
};

const login = async (req, res) => {
  try {
    console.log("Request:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    if (user.provider !== "local") {
      return sendError(res, 400, `This account uses ${user.provider} OAuth. Continue with OAuth instead.`);
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password");
    }

    if (!user.isVerified) {
      return sendError(res, 401, "Email is not verified. Please complete OTP verification.");
    }

    return sendSuccess(res, "Login successful", buildAuthData(user));
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, 500, "Server error");
  }
};

const sendOtp = async (req, res) => {
  try {
    console.log("Request:", req.body);
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, "Email is required");
    }

    const result = await issueOtpForPurpose({ email, purpose: "login" });

    if (result.error) {
      return sendError(res, result.statusCode, result.error);
    }

    if (!result.user) {
      return sendError(res, 401, "No account found for this email");
    }

    return sendSuccess(res, "OTP sent successfully", {
      email: result.email,
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    if (error.message === "Email sending failed") {
      return sendError(res, 500, "Email sending failed");
    }
    return sendError(res, 500, "Server error");
  }
};

const verifyOtp = async (req, res) => {
  try {
    console.log("Request:", req.body);
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, 400, "Email and OTP are required");
    }

    const normalizedEmail = normalizeEmail(email);
    let otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "register" });
    let purpose = "register";

    if (!otpRecord) {
      otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "login" });
      purpose = "login";
    }

    const otpValidation = await validateOtpRecord({ otpRecord, otp });
    if (!otpValidation.valid) {
      return sendError(res, 400, otpValidation.message);
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.provider !== "local") {
      return sendError(res, 401, "Account not found for OTP verification");
    }

    if (purpose === "register") {
      user.isVerified = true;
      await user.save();
    }

    await Otp.deleteOne({ _id: otpRecord._id });

    const successMessage = purpose === "register" ? "OTP verified successfully" : "Login successful";
    return sendSuccess(res, successMessage, buildAuthData(user));
  } catch (error) {
    console.error("Verify OTP error:", error);
    return sendError(res, 500, "Server error");
  }
};

const forgotPassword = async (req, res) => {
  try {
    console.log("Request:", req.body);
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, "Email is required");
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.provider !== "local") {
      return sendError(res, 401, "No local account found for this email");
    }

    const otpResult = await issueOtpForPurpose({ email: normalizedEmail, purpose: "reset" });
    if (otpResult.error) {
      return sendError(res, otpResult.statusCode, otpResult.error);
    }

    return sendSuccess(res, "Password reset OTP sent successfully", {
      email: normalizedEmail,
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    if (error.message === "Email sending failed") {
      return sendError(res, 500, "Email sending failed");
    }
    return sendError(res, 500, "Server error");
  }
};

const resetPassword = async (req, res) => {
  try {
    console.log("Request:", req.body);
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return sendError(res, 400, "Email, OTP, and newPassword are required");
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    const normalizedEmail = normalizeEmail(email);
    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "reset" });
    const otpValidation = await validateOtpRecord({ otpRecord, otp });

    if (!otpValidation.valid) {
      return sendError(res, 400, otpValidation.message);
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user || user.provider !== "local") {
      return sendError(res, 401, "Local account not found for this email");
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.isVerified = true;
    await user.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    return sendSuccess(res, "Password reset successful", {
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return sendError(res, 500, "Server error");
  }
};

const getMe = async (req, res) => {
  try {
    console.log("Request:", req.body);
    return sendSuccess(res, "User profile fetched successfully", {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return sendError(res, 500, "Server error");
  }
};

const oauthSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 401, "OAuth authentication failed");
    }

    const token = signToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      return sendError(res, 500, "FRONTEND_URL is not configured");
    }

    return res.redirect(`${frontendUrl}/auth/success?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error("OAuth success error:", error);
    return sendError(res, 500, "Server error");
  }
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
