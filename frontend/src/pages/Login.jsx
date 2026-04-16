import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const STEPS = {
  EMAIL: "email",
  OTP: "otp",
};

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSendingOtp(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await API.post("/auth/send-otp", { email: normalizedEmail });
      setEmail(normalizedEmail);
      setStep(STEPS.OTP);
      setStatus(`OTP sent to ${normalizedEmail}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsVerifyingOtp(true);

    try {
      const { data } = await API.post("/auth/verify-otp", {
        email,
        otp,
      });

      localStorage.setItem("token", data.token);
      login(data);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const resetToEmailStep = () => {
    setStep(STEPS.EMAIL);
    setOtp("");
    setError("");
    setStatus("");
  };

  return (
    <main className="auth-shell">
      <section className="auth-card fade-in-up">
        <h1>{step === STEPS.EMAIL ? "Login to BuildStack" : "Verify OTP"}</h1>
        <p className="auth-subtitle">
          {step === STEPS.EMAIL
            ? "Enter your email to receive a one-time password."
            : `Enter the 6-digit code sent to ${email}.`}
        </p>

        <div className="oauth-stack">
          <button type="button" className="oauth-btn" disabled aria-disabled="true">
            Continue with Google
          </button>
          <button type="button" className="oauth-btn github" disabled aria-disabled="true">
            Continue with GitHub
          </button>
        </div>

        <div className="auth-divider">or use email OTP</div>

        <div className={`auth-step ${step === STEPS.EMAIL ? "is-active" : ""}`}>
          {step === STEPS.EMAIL ? (
            <form className="auth-form" onSubmit={handleSendOtp}>
              <input
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              {error ? <p className="form-error">{error}</p> : null}
              {status ? <p className="form-success">{status}</p> : null}

              <button type="submit" disabled={isSendingOtp || !email.trim()}>
                {isSendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <input
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                required
              />

              {error ? <p className="form-error">{error}</p> : null}
              {status ? <p className="form-success">{status}</p> : null}

              <button type="submit" disabled={isVerifyingOtp || otp.length !== 6}>
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>

              <button type="button" className="text-btn" onClick={resetToEmailStep}>
                Use a different email
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Login;
