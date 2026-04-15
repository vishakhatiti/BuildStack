const express = require("express");
const passport = require("passport");
const {
  requestSignupOtp,
  verifySignupOtp,
  requestLoginOtp,
  verifyLoginOtp,
  getMe,
  oauthSuccess,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register/request-otp", requestSignupOtp);
router.post("/register/verify-otp", verifySignupOtp);
router.post("/login/request-otp", requestLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);
router.get("/me", protect, getMe);

router.get("/oauth/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/oauth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/auth/oauth/failure" }),
  oauthSuccess
);

router.get("/oauth/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get(
  "/oauth/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/api/auth/oauth/failure" }),
  oauthSuccess
);

router.get("/oauth/failure", (_req, res) => {
  res.status(401).json({ message: "OAuth authentication failed" });
});

module.exports = router;
