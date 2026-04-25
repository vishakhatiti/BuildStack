import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API, { AUTH_BASE_URL } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import OAuthButton from "../components/ui/OAuthButton";

const GOOGLE_OAUTH_URL = `${AUTH_BASE_URL}/api/auth/google`;
const GITHUB_OAUTH_URL = `${AUTH_BASE_URL}/api/auth/github`;
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
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [signInError, setSignInError] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpNotice, setSignUpNotice] = useState("");

  const otpRefs = useRef([]);
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

  useEffect(() => {
    if (!isOtpStep) return;
    otpRefs.current[0]?.focus();
  }, [isOtpStep]);

  const switchTo = (tab) => {
    setActiveTab(tab);
    setSignInError("");
    setSignUpError("");
    setSignUpNotice("");
    setSignupStep(SIGNUP_STEPS.PROFILE);
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setResendTimer(0);
  };

  const updateSignIn = (key, value) => {
    setSignInForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSignUp = (key, value) => {
    setSignUpForm((prev) => ({ ...prev, [key]: value }));
  };

  const otpValue = otpDigits.join("");

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
      setOtpDigits(Array(OTP_LENGTH).fill(""));
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

  const handleOtpChange = (index, value) => {
    const sanitized = value.replace(/\D/g, "");
    if (!sanitized) {
      setOtpDigits((previous) => {
        const next = [...previous];
        next[index] = "";
        return next;
      });
      return;
    }

    setOtpDigits((previous) => {
      const next = [...previous];
      let writeIndex = index;

      for (const digit of sanitized.slice(0, OTP_LENGTH - index)) {
        next[writeIndex] = digit;
        writeIndex += 1;
      }

      return next;
    });

    const nextFocusIndex = Math.min(index + sanitized.length, OTP_LENGTH - 1);
    otpRefs.current[nextFocusIndex]?.focus();
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key !== "Backspace") return;

    if (otpDigits[index]) {
      setOtpDigits((previous) => {
        const next = [...previous];
        next[index] = "";
        return next;
      });
      return;
    }

    if (index > 0) {
      setOtpDigits((previous) => {
        const next = [...previous];
        next[index - 1] = "";
        return next;
      });
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pastedDigits) return;

    setOtpDigits((previous) => {
      const next = [...previous];
      for (let index = 0; index < OTP_LENGTH; index += 1) {
        next[index] = pastedDigits[index] || "";
      }
      return next;
    });

    const focusIndex = Math.min(pastedDigits.length, OTP_LENGTH) - 1;
    if (focusIndex >= 0) {
      otpRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <main className="auth-shell page-fade-in">
      <div className="auth-container">
        <Card className="auth-card clean-auth-card auth-premium-card">
          <Link to="/" className="auth-backlink">
            ← Back to home
          </Link>

          <h1 className="auth-title">
            {activeTab === "signin" ? "Welcome back" : signupStep === SIGNUP_STEPS.OTP ? "Verify your email" : "Create your account"}
          </h1>
          <p className="auth-subtext">
            {activeTab === "signin"
              ? "Sign in to continue building with your workspace."
              : signupStep === SIGNUP_STEPS.OTP
                ? `Enter the 6-digit OTP sent to ${signupEmail}.`
                : "Set up your account with a quick 2-step flow."}
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

          {activeTab === "signin" ? (
            <section className="auth-panel" aria-hidden={false}>
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

              <div className="auth-oauth-section">
                <div className="auth-divider">OR CONTINUE WITH</div>
                <div className="oauth-grid auth-oauth-grid">
                  <OAuthButton provider="google" onClick={() => launchOAuth("google")}>
                    Continue with Google
                  </OAuthButton>
                  <OAuthButton provider="github" onClick={() => launchOAuth("github")}>
                    Continue with GitHub
                  </OAuthButton>
                </div>
              </div>

              <p className="auth-footnote modern-auth-footnote">
                Don&apos;t have an account?{" "}
                <button type="button" className="auth-inline-link" onClick={() => switchTo("signup")}>
                  Sign Up
                </button>
              </p>
            </section>
          ) : (
            <section className="auth-panel" aria-hidden={false}>
              <div className="signup-progress" aria-label="Signup steps">
                <p className="signup-step-count">{signupStep === SIGNUP_STEPS.OTP ? "Step 3 of 3" : `Step ${signupStep} of 2`}</p>
                <div className="signup-steps-rail">
                  <span className={`signup-step-pill ${signupStep >= SIGNUP_STEPS.PROFILE ? "active" : ""}`}>Step 1</span>
                  <span className={`signup-step-pill ${signupStep >= SIGNUP_STEPS.PASSWORD ? "active" : ""}`}>Step 2</span>
                  <span className={`signup-step-pill ${signupStep >= SIGNUP_STEPS.OTP ? "active" : ""}`}>Step 3</span>
                </div>
              </div>

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
                  <div className="otp-input-group signup-step-content" onPaste={handleOtpPaste} key="signup-otp-step">
                    <span className="field-hint">Verification Code</span>
                    <div className="otp-input-row">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={`otp-${index}`}
                          ref={(element) => {
                            otpRefs.current[index] = element;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          className="otp-digit-input"
                          maxLength={1}
                          value={digit}
                          onChange={(event) => handleOtpChange(index, event.target.value)}
                          onKeyDown={(event) => handleOtpKeyDown(index, event)}
                          aria-label={`OTP digit ${index + 1}`}
                        />
                      ))}
                    </div>
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
                      Verify
                    </Button>
                    <Button type="button" variant="ghost" onClick={resendSignupOtp} disabled={resendTimer > 0 || isResendingOtp}>
                      {isResendingOtp ? "Resending..." : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                    </Button>
                  </div>
                ) : null}
              </form>

              <div className="auth-oauth-section">
                <div className="auth-divider">OR CONTINUE WITH</div>
                <div className="oauth-grid auth-oauth-grid">
                  <OAuthButton provider="google" onClick={() => launchOAuth("google")}>
                    Continue with Google
                  </OAuthButton>
                  <OAuthButton provider="github" onClick={() => launchOAuth("github")}>
                    Continue with GitHub
                  </OAuthButton>
                </div>
              </div>

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
