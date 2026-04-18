import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Features from "../components/Features";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import OAuthButton from "../components/ui/OAuthButton";
import { AUTH_BASE_URL } from "../services/api";

const Landing = () => {
  const oauth = (provider) => {
    window.location.href = `${AUTH_BASE_URL}/api/auth/${provider}`;
  };

  return (
    <div className="landing-page page-fade-in" id="home">
      <Navbar />

      <main className="hero-section">
        <div className="page hero-content">
          <p className="badge">Project management for fast-moving teams</p>
          <h1>
            Launch faster with <span>clarity, control, and confidence.</span>
          </h1>
          <p className="hero-subtext">
            BuildStack helps modern teams manage projects, track deployment outcomes, and collaborate
            in one clean workspace built for execution.
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

          <div className="oauth-grid">
            <OAuthButton provider="google" onClick={() => oauth("google")}>
              Continue with Google
            </OAuthButton>
            <OAuthButton provider="github" onClick={() => oauth("github")}>
              Continue with GitHub
            </OAuthButton>
          </div>

          <p className="trust-line">Trusted by startup teams shipping every day</p>
        </div>
      </main>

      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
