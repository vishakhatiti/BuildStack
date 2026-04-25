import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API, { AUTH_BASE_URL } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import OAuthButton from "../components/ui/OAuthButton";

const GOOGLE_OAUTH_URL = `${AUTH_BASE_URL}/api/auth/google`;
const GITHUB_OAUTH_URL = `${AUTH_BASE_URL}/api/auth/github`;

const initialSignInForm = {
  email: "",
  password: "",
};

const initialSignUpForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  otp: "",
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [activeTab, setActiveTab] = useState(query.get("tab") === "signup" ? "signup" : "signin");
  const [signInForm, setSignInForm] = useState(initialSignInForm);
  const [signUpForm, setSignUpForm] = useState(initialSignUpForm);

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpNotice, setSignUpNotice] = useState("");
  const [requiresOtpVerification, setRequiresOtpVerification] = useState(false);

  useEffect(() => {
    setActiveTab(query.get("tab") === "signup" ? "signup" : "signin");
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expectedTab = params.get("tab") === "signup" ? "signup" : "signin";
    if (expectedTab === activeTab) return;

    if (activeTab === "signup") {
      params.set("tab", "signup");
    } else {
      params.delete("tab");
    }

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  }, [activeTab, location.pathname, location.search, navigate]);

  const switchTo = (tab) => {
    setActiveTab(tab);
    setSignInError("");
    setSignUpError("");
    setSignUpNotice("");
  };

  const updateSignIn = (key, value) => {
    setSignInForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSignUp = (key, value) => {
    setSignUpForm((prev) => ({ ...prev, [key]: value }));
  };

  const launchOAuth = (provider) => {
    window.location.href = provider === "google" ? GOOGLE_OAUTH_URL : GITHUB_OAUTH_URL;
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setSignInError("");

    if (!signInForm.email.trim() || !signInForm.password) {
      setSignInError("Email and password are required.");
      return;
    }

    try {
      setIsSigningIn(true);
      const { data } = await API.post("/auth/login", {
        email: signInForm.email.trim().toLowerCase(),
        password: signInForm.password,
      });

      login(data);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setSignInError(requestError.response?.data?.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setSignUpError("");
    setSignUpNotice("");

    const normalizedEmail = signUpForm.email.trim().toLowerCase();
    const normalizedName = signUpForm.name.trim();

    if (!normalizedName || !normalizedEmail || !signUpForm.password || !signUpForm.confirmPassword) {
      setSignUpError("Please complete all fields.");
      return;
    }

    if (signUpForm.password.length < 8) {
      setSignUpError("Password must be at least 8 characters.");
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setSignUpError("Passwords do not match.");
      return;
    }

    try {
      setIsSigningUp(true);
      const { data } = await API.post("/auth/register", {
        name: normalizedName,
        email: normalizedEmail,
        password: signUpForm.password,
      });

      setSignUpForm((prev) => ({ ...prev, name: normalizedName, email: normalizedEmail, otp: "" }));
      setRequiresOtpVerification(true);
      setSignUpNotice(data.message || "Account created. Enter the OTP sent to your inbox.");
    } catch (requestError) {
      setSignUpError(requestError.response?.data?.message || "Unable to create account. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleVerifySignupOtp = async (event) => {
    event.preventDefault();
    setSignUpError("");

    if (signUpForm.otp.length !== 6) {
      setSignUpError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    try {
      setIsVerifyingSignup(true);
      const { data } = await API.post("/auth/verify-otp", {
        email: signUpForm.email.trim().toLowerCase(),
        otp: signUpForm.otp,
      });

      login(data);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setSignUpError(requestError.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setIsVerifyingSignup(false);
    }
  };

  const resendSignupOtp = async () => {
    setSignUpError("");
    setSignUpNotice("");

    try {
      setIsSigningUp(true);
      const { data } = await API.post("/auth/register", {
        name: signUpForm.name.trim(),
        email: signUpForm.email.trim().toLowerCase(),
        password: signUpForm.password,
      });
      setSignUpNotice(data.message || "A new OTP has been sent.");
    } catch (requestError) {
      setSignUpError(requestError.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <main className="auth-shell page-fade-in">
      <Card className="auth-card clean-auth-card auth-premium-card">
        <Link to="/" className="auth-backlink">
          ← Back to home
        </Link>

        <h1 className="auth-title">{activeTab === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtext">
          {activeTab === "signin"
            ? "Sign in to continue building with your workspace."
            : "Set up your account and get started in seconds."}
        </p>

        <div className="tabs premium-tabs" role="tablist" aria-label="Authentication tabs">
          <button
            type="button"
            className={activeTab === "signin" ? "tab active" : "tab"}
            onClick={() => switchTo("signin")}
            role="tab"
            aria-selected={activeTab === "signin"}
          >
            Sign In
          </button>
          <button
            type="button"
            className={activeTab === "signup" ? "tab active" : "tab"}
            onClick={() => switchTo("signup")}
            role="tab"
            aria-selected={activeTab === "signup"}
          >
            Sign Up
          </button>
        </div>

        <div className={`auth-panels ${activeTab === "signup" ? "show-signup" : "show-signin"}`}>
          <section className="auth-panel" aria-hidden={activeTab !== "signin"}>
            <form className="auth-form" onSubmit={handleSignIn}>
              <Input
                id="signin-email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={signInForm.email}
                onChange={(event) => updateSignIn("email", event.target.value)}
              />
              <Input
                id="signin-password"
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={signInForm.password}
                onChange={(event) => updateSignIn("password", event.target.value)}
              />

              <Link to="/forgot-password" className="auth-inline-link auth-forgot-link">
                Forgot password?
              </Link>

              {signInError ? <p className="form-error">{signInError}</p> : null}

              <Button loading={isSigningIn} type="submit" className="btn-block">
                Sign In
              </Button>
            </form>

            <div className="auth-divider">OR CONTINUE WITH</div>
            <div className="oauth-grid auth-oauth-grid">
              <OAuthButton provider="google" onClick={() => launchOAuth("google")}>
                Continue with Google
              </OAuthButton>
              <OAuthButton provider="github" onClick={() => launchOAuth("github")}>
                Continue with GitHub
              </OAuthButton>
            </div>

            <p className="auth-footnote modern-auth-footnote">
              Don't have an account?{" "}
              <button type="button" className="auth-inline-link" onClick={() => switchTo("signup")}>
                Sign Up
              </button>
            </p>
          </section>

          <section className="auth-panel" aria-hidden={activeTab !== "signup"}>
            <form className="auth-form" onSubmit={requiresOtpVerification ? handleVerifySignupOtp : handleSignUp}>
              <Input
                id="signup-name"
                label="Name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={signUpForm.name}
                onChange={(event) => updateSignUp("name", event.target.value)}
                disabled={requiresOtpVerification}
              />
              <Input
                id="signup-email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={signUpForm.email}
                onChange={(event) => updateSignUp("email", event.target.value)}
                disabled={requiresOtpVerification}
              />
              <Input
                id="signup-password"
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={signUpForm.password}
                onChange={(event) => updateSignUp("password", event.target.value)}
                disabled={requiresOtpVerification}
              />
              <Input
                id="signup-confirm-password"
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={signUpForm.confirmPassword}
                onChange={(event) => updateSignUp("confirmPassword", event.target.value)}
                disabled={requiresOtpVerification}
              />

              {requiresOtpVerification ? (
                <Input
                  id="signup-otp"
                  label="Verification Code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={signUpForm.otp}
                  onChange={(event) => updateSignUp("otp", event.target.value.replace(/\D/g, ""))}
                />
              ) : null}

              {signUpNotice ? <p className="form-notice">{signUpNotice}</p> : null}
              {signUpError ? <p className="form-error">{signUpError}</p> : null}

              {requiresOtpVerification ? (
                <div className="auth-stacked-actions">
                  <Button loading={isVerifyingSignup} type="submit" className="btn-block" disabled={signUpForm.otp.length !== 6}>
                    Verify & Continue
                  </Button>
                  <Button type="button" variant="ghost" onClick={resendSignupOtp} disabled={isSigningUp}>
                    {isSigningUp ? "Resending..." : "Resend code"}
                  </Button>
                </div>
              ) : (
                <Button loading={isSigningUp} type="submit" className="btn-block">
                  Create Account
                </Button>
              )}
            </form>

            <div className="auth-divider">OR CONTINUE WITH</div>
            <div className="oauth-grid auth-oauth-grid">
              <OAuthButton provider="google" onClick={() => launchOAuth("google")}>
                Continue with Google
              </OAuthButton>
              <OAuthButton provider="github" onClick={() => launchOAuth("github")}>
                Continue with GitHub
              </OAuthButton>
            </div>

            <p className="auth-footnote modern-auth-footnote">
              Already have an account?{" "}
              <button type="button" className="auth-inline-link" onClick={() => switchTo("signin")}>
                Sign In
              </button>
            </p>
          </section>
        </div>
      </Card>
    </main>
  );
};

export default Auth;
