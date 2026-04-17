import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import OTPInput from "../components/ui/OTPInput";

const OTP_COOLDOWN_SECONDS = 30;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    clearFeedback();

    try {
      setLoading(true);
      await API.post("/auth/forgot-password", { email });
      setStep("reset");
      setCooldown(OTP_COOLDOWN_SECONDS);
      setMessage("If your account exists, an OTP has been sent to your email.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    clearFeedback();
    try {
      setLoading(true);
      await API.post("/auth/reset-password", { email, otp, newPassword });
      setMessage("Password reset successful. Redirecting to sign in...");
      setTimeout(() => navigate("/auth", { replace: true }), 1200);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (loading || cooldown > 0) return;
    clearFeedback();
    try {
      setLoading(true);
      await API.post("/auth/forgot-password", { email });
      setCooldown(OTP_COOLDOWN_SECONDS);
      setMessage("OTP resent.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell page-fade-in">
      <div className="auth-ambient" aria-hidden="true" />
      <Card className="auth-card" style={{ maxWidth: 460, width: "100%" }}>
        <h2>Forgot password</h2>
        {step === "request" ? (
          <form className="auth-form" onSubmit={requestOtp}>
            <Input
              id="forgot-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
            <Button loading={loading} type="submit" className="btn-block">
              Send OTP
            </Button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={resetPassword}>
            <p className="otp-meta">Enter OTP and your new password.</p>
            <OTPInput value={otp} onChange={setOtp} disabled={loading} />
            <Input
              id="new-password"
              label="New Password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 8 characters"
            />
            <Button loading={loading} type="submit" className="btn-block" disabled={otp.length !== 6}>
              Reset Password
            </Button>
            <Button type="button" variant="ghost" onClick={resendOtp} disabled={loading || cooldown > 0}>
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </Button>
          </form>
        )}

        {message ? <p className="form-notice">{message}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <p style={{ marginTop: 16 }}>
          <Link to="/auth" className="field-hint">
            Back to Sign In
          </Link>
        </p>
      </Card>
    </main>
  );
};

export default ForgotPassword;
