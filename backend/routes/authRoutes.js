const express = require("express");
const passport = require("passport");
const {
  register,
  sendOtp,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  oauthSuccess,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
const ensureOauthStrategy = (provider) => (req, res, next) => {
  if (!passport._strategy(provider)) {
    return res.status(503).json({ message: `${provider} OAuth is not configured on the server` });
  }
  return next();
};

router.post("/register", register);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

router.get("/google", ensureOauthStrategy("google"), passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  ensureOauthStrategy("google"),
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/oauth/failure",
  }),
  oauthSuccess
);

router.get("/github", ensureOauthStrategy("github"), passport.authenticate("github", { scope: ["user:email"] }));
router.get(
  "/github/callback",
  ensureOauthStrategy("github"),
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/api/auth/oauth/failure",
  }),
  oauthSuccess
);

router.get("/oauth/failure", (_req, res) => {
  res.status(401).json({ message: "OAuth authentication failed" });
});

module.exports = router;
