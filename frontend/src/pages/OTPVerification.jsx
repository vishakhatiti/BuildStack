import { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const flowState = location.state;

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const endpoint = useMemo(() => {
    if (flowState?.purpose === "signup") return "/auth/register/verify-otp";
    if (flowState?.purpose === "login") return "/auth/login/verify-otp";
    return null;
  }, [flowState?.purpose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!endpoint || !flowState?.otpSessionId) {
      setError("Session expired. Please login or register again.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await API.post(endpoint, {
        otpSessionId: flowState.otpSessionId,
        otp,
      });
      login(data);
      navigate("/dashboard", { replace: true });
    } catch (verifyError) {
      setError(verifyError.response?.data?.message || "OTP verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card fade-in-up">
        <h1>Verify your one-time code</h1>
        <p className="auth-subtitle">Enter the 6-digit code sent to {flowState?.email || "your email"}.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <button type="submit" disabled={isSubmitting || otp.length !== 6}>
            {isSubmitting ? "Verifying..." : "Verify and continue"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default OTPVerification;
