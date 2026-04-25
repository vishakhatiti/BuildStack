import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import OTPInput from "../components/ui/OTPInput";
const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 30;

const initialSignInForm = {
  email: "",
  password: "",
};

const initialSignUpForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const SIGNUP_STEPS = {
  PROFILE: 1,
  PASSWORD: 2,
  OTP: 3,
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [activeTab, setActiveTab] = useState(query.get("tab") === "signup" ? "signup" : "signin");
  const [signInForm, setSignInForm] = useState(initialSignInForm);
  const [signUpForm, setSignUpForm] = useState(initialSignUpForm);
  const [signupStep, setSignupStep] = useState(SIGNUP_STEPS.PROFILE);
  const [signupEmail, setSignupEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [signInError, setSignInError] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpNotice, setSignUpNotice] = useState("");

  const isOtpStep = signupStep === SIGNUP_STEPS.OTP;

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

  useEffect(() => {
    if (!isOtpStep || resendTimer <= 0) return undefined;

    const intervalId = window.setInterval(() => {
      setResendTimer((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isOtpStep, resendTimer]);

  const switchTo = (tab) => {
    setActiveTab(tab);
    setSignInError("");
    setSignUpError("");
    setSignUpNotice("");
    setSignupStep(SIGNUP_STEPS.PROFILE);
    setOtpValue("");
    setResendTimer(0);
  };

  const updateSignIn = (key, value) => {
    setSignInForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSignUp = (key, value) => {
    setSignUpForm((prev) => ({ ...prev, [key]: value }));
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

  const handleContinueSignup = (event) => {
    event.preventDefault();
    setSignUpError("");

    const normalizedEmail = signUpForm.email.trim().toLowerCase();
    const normalizedName = signUpForm.name.trim();

    if (!normalizedName || !normalizedEmail) {
      setSignUpError("Name and email are required.");
      return;
    }

    setSignUpForm((prev) => ({ ...prev, name: normalizedName, email: normalizedEmail }));
    setSignupStep(SIGNUP_STEPS.PASSWORD);
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setSignUpError("");
    setSignUpNotice("");

    const normalizedEmail = signUpForm.email.trim().toLowerCase();
    const normalizedName = signUpForm.name.trim();

    if (!signUpForm.password || !signUpForm.confirmPassword) {
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

      setSignUpForm((prev) => ({ ...prev, name: normalizedName, email: normalizedEmail }));
      setSignupEmail(normalizedEmail);
      setSignupStep(SIGNUP_STEPS.OTP);
      setOtpValue("");
      setResendTimer(OTP_RESEND_SECONDS);
      setSignUpNotice(data.message || `Account created. Enter the OTP sent to ${normalizedEmail}.`);
    } catch (requestError) {
      setSignUpError(requestError.response?.data?.message || "Unable to create account. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleVerifySignupOtp = async (event) => {
    event.preventDefault();
    setSignUpError("");

    if (otpValue.length !== OTP_LENGTH) {
      setSignUpError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    try {
      setIsVerifyingSignup(true);
      const { data } = await API.post("/auth/verify-otp", {
        email: signupEmail,
        otp: otpValue,
      });

      login(data);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const backendMessage = requestError.response?.data?.message || "OTP verification failed. Please try again.";
      const normalizedMessage = backendMessage.toLowerCase();

      if (normalizedMessage.includes("expired")) {
        setSignUpError("Expired OTP. Please resend OTP and try again.");
      } else if (normalizedMessage.includes("invalid") || normalizedMessage.includes("incorrect")) {
        setSignUpError("Invalid OTP. Please enter the correct 6-digit code.");
      } else {
        setSignUpError(backendMessage);
      }
    } finally {
      setIsVerifyingSignup(false);
    }
  };

  const resendSignupOtp = async () => {
    if (resendTimer > 0 || !signupEmail) return;

    setSignUpError("");
    setSignUpNotice("");

    try {
      setIsResendingOtp(true);
      const { data } = await API.post("/auth/send-otp", {
        email: signupEmail,
      });
      setResendTimer(OTP_RESEND_SECONDS);
      setSignUpNotice(data.message || "A new OTP has been sent to your email.");
    } catch (requestError) {
      setSignUpError(requestError.response?.data?.message || "Unable to resend OTP.");
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <main className="auth-shell page-fade-in">
      <div className="auth-container">
        <Link to="/" className="auth-home-link">
          ← Back to Home
        </Link>
        <Card className={`auth-card auth-premium-card auth-compact-card ${activeTab === "signup" ? "auth-card--signup" : "auth-card--signin"}`}>
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

          {activeTab === "signin" ? (
            <section className="auth-panel auth-signin-panel" aria-hidden={false}>
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtext">Sign in to BuildStack and continue shipping with your team.</p>

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

                <Button loading={isSigningIn} type="submit" className="btn-block auth-primary-action">
                  Sign In
                </Button>
              </form>

              <p className="auth-footnote modern-auth-footnote">
                Don&apos;t have an account?{" "}
                <button type="button" className="auth-inline-link" onClick={() => switchTo("signup")}>
                  Sign Up
                </button>
              </p>
            </section>
          ) : (
            <section className="auth-panel auth-signup-panel" aria-hidden={false}>
              <h1 className="auth-title">{isOtpStep ? "Verify your email" : "Create your account"}</h1>
              <p className="auth-subtext">
                {isOtpStep
                  ? `Enter the 6-digit code sent to ${signupEmail}.`
                  : "Get started in under a minute with a simple two-step signup."}
              </p>
              {!isOtpStep ? (
                <div className="signup-progress" aria-label="Signup steps">
                  <p className="signup-step-count">Step {signupStep} of 2</p>
                  <div className="signup-steps-rail">
                    <span className={`signup-step-pill ${signupStep >= SIGNUP_STEPS.PROFILE ? "active" : ""}`}>Step 1</span>
                    <span className={`signup-step-pill ${signupStep >= SIGNUP_STEPS.PASSWORD ? "active" : ""}`}>Step 2</span>
                  </div>
                </div>
              ) : null}

              <form className="auth-form" onSubmit={isOtpStep ? handleVerifySignupOtp : signupStep === SIGNUP_STEPS.PROFILE ? handleContinueSignup : handleSignUp}>
                {signupStep === SIGNUP_STEPS.PROFILE ? (
                  <div className="signup-step-content" key="signup-profile-step">
                    <Input
                      id="signup-name"
                      label="Name"
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      value={signUpForm.name}
                      onChange={(event) => updateSignUp("name", event.target.value)}
                    />
                    <Input
                      id="signup-email"
                      label="Email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={signUpForm.email}
                      onChange={(event) => updateSignUp("email", event.target.value)}
                    />
                  </div>
                ) : null}

                {signupStep === SIGNUP_STEPS.PASSWORD ? (
                  <div className="signup-step-content" key="signup-password-step">
                    <Input
                      id="signup-password"
                      label="Password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      value={signUpForm.password}
                      onChange={(event) => updateSignUp("password", event.target.value)}
                    />
                    <Input
                      id="signup-confirm-password"
                      label="Confirm Password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={signUpForm.confirmPassword}
                      onChange={(event) => updateSignUp("confirmPassword", event.target.value)}
                    />
                  </div>
                ) : null}

                {isOtpStep ? (
                  <div className="signup-step-content" key="signup-otp-step">
                    <span className="field-hint otp-title">Verification Code</span>
                    <OTPInput value={otpValue} onChange={setOtpValue} disabled={isVerifyingSignup} />
                  </div>
                ) : null}

                {signUpNotice ? <p className="form-notice">{signUpNotice}</p> : null}
                {signUpError ? <p className="form-error">{signUpError}</p> : null}

                {signupStep === SIGNUP_STEPS.PROFILE ? (
                  <Button type="submit" className="btn-block auth-primary-action">
                    Continue
                  </Button>
                ) : null}

                {signupStep === SIGNUP_STEPS.PASSWORD ? (
                  <div className="auth-stacked-actions">
                    <Button loading={isSigningUp} type="submit" className="btn-block auth-primary-action">
                      Create Account
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setSignupStep(SIGNUP_STEPS.PROFILE)}>
                      Back
                    </Button>
                  </div>
                ) : null}

                {isOtpStep ? (
                  <div className="auth-stacked-actions">
                    <Button
                      loading={isVerifyingSignup}
                      type="submit"
                      className="btn-block auth-primary-action"
                      disabled={otpValue.length !== OTP_LENGTH}
                    >
                      Verify OTP
                    </Button>
                    <Button type="button" variant="ghost" onClick={resendSignupOtp} disabled={resendTimer > 0 || isResendingOtp}>
                      {isResendingOtp ? "Resending..." : resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : "Resend OTP"}
                    </Button>
                  </div>
                ) : null}
              </form>

              <p className="auth-footnote modern-auth-footnote">
                Already have an account?{" "}
                <button type="button" className="auth-inline-link" onClick={() => switchTo("signin")}>
                  Sign In
                </button>
              </p>
            </section>
          )}
        </Card>
      </div>
    </main>
  );
};

export default Auth;
