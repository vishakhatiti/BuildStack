const express = require("express");
const passport = require("passport");
const { sendOtp, verifyOtp, getMe, oauthSuccess } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", protect, getMe);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/auth/oauth/failure" }),
  oauthSuccess
);

router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/api/auth/oauth/failure" }),
  oauthSuccess
);

router.get("/oauth/failure", (_req, res) => {
  res.status(401).json({ message: "OAuth authentication failed" });
});

module.exports = router;
