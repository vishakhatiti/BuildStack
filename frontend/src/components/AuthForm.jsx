import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Button from "./ui/Button";
import Input from "./ui/Input";
import OTPInput from "./ui/OTPInput";

const OTP_COOLDOWN_SECONDS = 30;
const BACKEND_URL = "https://buildstack-kmdz.onrender.com";

const initialForm = {
  name: "",
  email: "",
  otp: "",
};

const maskEmail = (email = "") => {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "your email";
  return `${name.charAt(0)}***@${domain}`;
};

const normalizeError = (message = "") => {
  const lower = message.toLowerCase();
  if (lower.includes("expired")) return "Expired OTP. Request a new code and try again.";
  if (lower.includes("invalid otp") || lower.includes("invalid or expired otp")) return "Wrong OTP. Please check the code and retry.";
  return message;
};

const AuthForm = ({ mode = "login", onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", otp: "", general: "" });
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const title = useMemo(() => (mode === "signup" ? "Create your BuildStack account" : "Welcome back"), [mode]);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = setInterval(() => {
      setCooldown((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    setForm((previous) => ({ ...initialForm, name: mode === "signup" ? previous.name : "" }));
    setStep("email");
    setErrors({ email: "", otp: "", general: "" });
    setNotice("");
    setCooldown(0);
  }, [mode]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateEmailStep = () => {
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      setErrors({ email: "Invalid email", otp: "", general: "" });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrors({ email: "Invalid email", otp: "", general: "" });
      return false;
    }

    if (mode === "signup" && !form.name.trim()) {
      setErrors({ email: "", otp: "", general: "Name is required for signup." });
      return false;
    }

    return true;
  };

  const sendOtp = async (event) => {
    event.preventDefault();
    setErrors({ email: "", otp: "", general: "" });
    setNotice("");

    if (!validateEmailStep()) return;

    try {
      setLoading(true);
      await API.post("/auth/send-otp", { email: form.email.trim(), name: form.name.trim() });
      setStep("otp");
      setCooldown(OTP_COOLDOWN_SECONDS);
      setNotice("OTP sent. Enter the 6-digit code from your inbox.");
    } catch (requestError) {
      setErrors({
        email: "",
        otp: "",
        general: requestError.response?.data?.message || "Unable to send OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setErrors({ email: "", otp: "", general: "" });

    if (form.otp.length !== 6) {
      setErrors({ email: "", otp: "Wrong OTP. Please enter all 6 digits.", general: "" });
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/auth/verify-otp", {
        email: form.email.trim(),
        otp: form.otp.trim(),
        name: form.name.trim(),
      });

      onSuccess(data);
    } catch (requestError) {
      const friendlyError = normalizeError(requestError.response?.data?.message || "OTP verification failed.");
      setErrors({ email: "", otp: friendlyError, general: "" });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0 || loading) return;

    setErrors({ email: "", otp: "", general: "" });
    setNotice("");

    try {
      setLoading(true);
      await API.post("/auth/send-otp", { email: form.email.trim(), name: form.name.trim() });
      setCooldown(OTP_COOLDOWN_SECONDS);
      setNotice("A new OTP has been sent.");
    } catch (requestError) {
      setErrors({
        email: "",
        otp: "",
        general: requestError.response?.data?.message || "Unable to resend OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const oauth = (provider) => {
    const cleaned = BACKEND_URL.replace(/\/$/, "");
    window.location.href = `${cleaned}/api/auth/${provider}`;
  };

  return (
    <div className="auth-card fade-in-up">
      <h2>{title}</h2>
      <p className="auth-subtitle">We’ll send a 6-digit OTP to your email.</p>

      <div className="auth-progress" aria-label="Authentication steps">
        <div className={`progress-step ${step === "email" ? "active" : "completed"}`}>
          <span>1</span>
          <p>Step 1: Email</p>
        </div>
        <div className={`progress-step ${step === "otp" ? "active" : ""}`}>
          <span>2</span>
          <p>Step 2: OTP Verification</p>
        </div>
      </div>

      {step === "email" ? (
        <form onSubmit={sendOtp} className="auth-form">
          {mode === "signup" ? (
            <Input
              id="name"
              label="Name"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
            />
          ) : null}

          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email}
          />

          <Button loading={loading} type="submit" className="btn-block">
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="auth-form">
          <p className="otp-meta">Enter the code sent to <strong>{maskEmail(form.email.trim())}</strong>.</p>

          <OTPInput value={form.otp} onChange={(nextOtp) => update("otp", nextOtp)} disabled={loading} />
          {errors.otp ? <p className="form-error inline">{errors.otp}</p> : null}

          <Button loading={loading} type="submit" className="btn-block" disabled={form.otp.length !== 6}>
            Verify OTP
          </Button>

          <div className="otp-actions">
            <Button variant="ghost" type="button" onClick={resendOtp} disabled={cooldown > 0 || loading}>
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </Button>
            <Button
              variant="glass"
              type="button"
              onClick={() => {
                setStep("email");
                setForm((prev) => ({ ...prev, otp: "" }));
                setErrors({ email: "", otp: "", general: "" });
              }}
              disabled={loading}
            >
              Edit email
            </Button>
          </div>
        </form>
      )}

      {notice ? <p className="form-notice">{notice}</p> : null}
      {errors.general ? <p className="form-error">{errors.general}</p> : null}

      <div className="divider">or continue with</div>

      <div className="oauth-grid">
        <button className="btn btn-oauth" onClick={() => oauth("google")} type="button">
          <span aria-hidden="true">G</span>
          Continue with Google
        </button>
        <button className="btn btn-oauth" onClick={() => oauth("github")} type="button">
          <span aria-hidden="true">⌘</span>
          Continue with GitHub
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
