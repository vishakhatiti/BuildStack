import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API, { AUTH_BASE_URL } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import OTPInput from "../components/ui/OTPInput";
import Card from "../components/ui/Card";
import OAuthButton from "../components/ui/OAuthButton";

const OTP_COOLDOWN_SECONDS = 30;

const initialSignIn = { email: "", password: "" };
const initialSignUp = { name: "", email: "", password: "", confirmPassword: "", otp: "" };

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAuthLoading } = useContext(AuthContext);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [activeTab, setActiveTab] = useState(params.get("tab") === "signup" ? "signup" : "signin");

  const [signInForm, setSignInForm] = useState(initialSignIn);
  const [signUpForm, setSignUpForm] = useState(initialSignUp);
  const [signUpStep, setSignUpStep] = useState("form");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = setInterval(() => {
      setCooldown((previous) => (previous <= 1 ? 0 : previous - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const oauth = (provider) => {
    window.location.href = `${AUTH_BASE_URL}/api/auth/${provider}`;
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    clearFeedback();
    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", signInForm);
      login(data);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpStart = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/register", {
        name: signUpForm.name,
        email: signUpForm.email,
        password: signUpForm.password,
      });
      setSignUpStep("otp");
      setCooldown(OTP_COOLDOWN_SECONDS);
      setMessage("OTP sent to your email. Enter the 6-digit code to verify your account.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to start signup.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignUpOtp = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (signUpForm.otp.length !== 6) {
      setError("Please enter all 6 digits of OTP.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/auth/verify-otp", {
        email: signUpForm.email,
        otp: signUpForm.otp,
      });
      login(data);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendSignUpOtp = async () => {
    if (loading || cooldown > 0) return;
    clearFeedback();

    try {
      setLoading(true);
      await API.post("/auth/register", {
        name: signUpForm.name,
        email: signUpForm.email,
        password: signUpForm.password,
      });
      setCooldown(OTP_COOLDOWN_SECONDS);
      setMessage("A new OTP has been sent.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell page-fade-in">
      <div className="auth-ambient" aria-hidden="true" />
      <section className="auth-layout">
        <div className="auth-intro">
          <p className="intro-pill">Production-grade authentication</p>
          <h1>Sign in securely to BuildStack.</h1>
          <p>
            Email/password authentication, OTP account verification, forgot password recovery, and
            social login with Google and GitHub.
          </p>
          <div className="tabs" role="tablist" aria-label="Authentication tab selector">
            <button
              type="button"
              className={activeTab === "signin" ? "tab active" : "tab"}
              onClick={() => {
                clearFeedback();
                setActiveTab("signin");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={activeTab === "signup" ? "tab active" : "tab"}
              onClick={() => {
                clearFeedback();
                setActiveTab("signup");
              }}
            >
              Sign Up
            </button>
          </div>
        </div>

        <Card className="auth-card fade-in-up">
          {activeTab === "signin" ? (
            <form className="auth-form" onSubmit={handleSignIn}>
              <h2>Welcome back</h2>
              <Input
                id="signin-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={signInForm.email}
                onChange={(event) => setSignInForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="you@company.com"
              />
              <Input
                id="signin-password"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={signInForm.password}
                onChange={(event) =>
                  setSignInForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Enter your password"
              />
              <Link to="/forgot-password" className="field-hint" style={{ justifySelf: "end" }}>
                Forgot password?
              </Link>
              <Button loading={loading} type="submit" className="btn-block">
                Sign In
              </Button>
            </form>
          ) : signUpStep === "form" ? (
            <form className="auth-form" onSubmit={handleSignUpStart}>
              <h2>Create account</h2>
              <Input
                id="signup-name"
                label="Name"
                type="text"
                autoComplete="name"
                value={signUpForm.name}
                onChange={(event) => setSignUpForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Your full name"
              />
              <Input
                id="signup-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={signUpForm.email}
                onChange={(event) => setSignUpForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="you@company.com"
              />
              <Input
                id="signup-password"
                label="Password"
                type="password"
                autoComplete="new-password"
                value={signUpForm.password}
                onChange={(event) =>
                  setSignUpForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="At least 8 characters"
              />
              <Input
                id="signup-confirm-password"
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                value={signUpForm.confirmPassword}
                onChange={(event) =>
                  setSignUpForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
                placeholder="Re-enter your password"
              />
              <Button loading={loading} type="submit" className="btn-block">
                Send OTP
              </Button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleVerifySignUpOtp}>
              <h2>Verify your email</h2>
              <p className="otp-meta">Enter the OTP sent to {signUpForm.email}.</p>
              <OTPInput
                value={signUpForm.otp}
                onChange={(otp) => setSignUpForm((prev) => ({ ...prev, otp }))}
                disabled={loading}
              />
              <Button loading={loading} type="submit" className="btn-block" disabled={signUpForm.otp.length !== 6}>
                Verify OTP & Continue
              </Button>
              <div className="otp-actions">
                <Button type="button" variant="ghost" onClick={handleResendSignUpOtp} disabled={loading || cooldown > 0}>
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                </Button>
                <Button type="button" variant="glass" onClick={() => setSignUpStep("form")} disabled={loading}>
                  Edit details
                </Button>
              </div>
            </form>
          )}

          <div className="auth-divider" role="separator" aria-label="or continue with">
            <span>or continue with</span>
          </div>
          <div className="oauth-grid">
            <OAuthButton provider="google" onClick={() => oauth("google")}>
              Continue with Google
            </OAuthButton>
            <OAuthButton provider="github" onClick={() => oauth("github")}>
              Continue with GitHub
            </OAuthButton>
          </div>

          {message ? <p className="form-notice">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
        </Card>
      </section>
    </main>
  );
};

export default Auth;
