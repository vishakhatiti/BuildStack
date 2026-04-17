import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import OAuthButton from "../components/ui/OAuthButton";
import { AUTH_BASE_URL } from "../services/api";

const Landing = () => {
  const oauth = (provider) => {
    window.location.href = `${AUTH_BASE_URL}/api/auth/${provider}`;
  };

  return (
    <div className="landing-page page-fade-in" id="home">
      <Navbar />

      <main className="hero-section premium-hero">
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-orb" aria-hidden="true" />

        <div className="page hero-content hero-enter">
          <p className="badge">Secure SaaS authentication</p>
          <h1>
            Build, deploy, and <span>scale with confidence.</span>
          </h1>
          <p className="hero-subtext">
            BuildStack gives modern teams secure onboarding, OTP verification, password recovery,
            and social sign-in from day one.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/auth?tab=signup">
              Get Started
            </Link>
            <Link className="btn btn-secondary btn-lg" to="/auth">
              Sign In
            </Link>
          </div>

          <div className="auth-divider" role="separator" aria-label="or continue with">
            <span>or continue with</span>
          </div>

          <div className="oauth-grid hero-oauth-grid">
            <OAuthButton provider="google" onClick={() => oauth("google")}>
              Continue with Google
            </OAuthButton>
            <OAuthButton provider="github" onClick={() => oauth("github")}>
              Continue with GitHub
            </OAuthButton>
          </div>

          <p className="trust-line">Trusted by developers building modern apps</p>
        </div>
      </main>
    </div>
  );
};

export default Landing;
