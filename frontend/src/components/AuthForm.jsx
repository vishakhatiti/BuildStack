import { useMemo, useState } from "react";
import { API_BASE_URL } from "../services/api";
import API from "../services/api";

const initialForm = {
  name: "",
  email: "",
  otp: "",
};

const AuthForm = ({ mode = "login", onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const title = useMemo(() => (mode === "signup" ? "Create your account" : "Welcome back"), [mode]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const sendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.email) {
      setError("Email is required.");
      return;
    }

    if (mode === "signup" && !form.name.trim()) {
      setError("Name is required for signup.");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/send-otp", { email: form.email.trim(), name: form.name.trim() });
      setStep("otp");
      setNotice("OTP sent. Check your inbox and enter the 6-digit code.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.otp) {
      setError("OTP is required.");
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
      setError(requestError.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const oauth = (provider) => {
    if (!API_BASE_URL) {
      setError("Missing VITE_API_URL. OAuth redirect cannot start.");
      return;
    }
    const cleaned = API_BASE_URL.replace(/\/$/, "");
    window.location.href = `${cleaned}/auth/oauth/${provider}`;
  };

  return (
    <div className="auth-card">
      <h2>{title}</h2>
      <p className="auth-subtitle">Secure OTP authentication with real backend integration.</p>

      {step === "email" ? (
        <form onSubmit={sendOtp} className="auth-form">
          {mode === "signup" ? (
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </label>

          <button disabled={loading} type="submit" className="btn btn-primary btn-block">
            {loading ? <span className="spinner small" /> : null}
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="auth-form">
          <label>
            OTP
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={form.otp}
              onChange={(e) => update("otp", e.target.value)}
              placeholder="Enter 6-digit OTP"
            />
          </label>

          <button disabled={loading} type="submit" className="btn btn-primary btn-block">
            {loading ? <span className="spinner small" /> : null}
            Verify OTP
          </button>

          <button
            className="btn btn-ghost btn-block"
            type="button"
            onClick={() => {
              setStep("email");
              setForm((prev) => ({ ...prev, otp: "" }));
            }}
            disabled={loading}
          >
            Edit email
          </button>
        </form>
      )}

      {notice ? <p className="form-notice">{notice}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="divider">or continue with</div>

      <div className="oauth-grid">
        <button className="btn btn-oauth" onClick={() => oauth("google")} type="button">
          Continue with Google
        </button>
        <button className="btn btn-oauth" onClick={() => oauth("github")} type="button">
          Continue with GitHub
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
