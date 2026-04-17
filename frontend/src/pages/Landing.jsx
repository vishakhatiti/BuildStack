import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AUTH_BASE_URL } from "../services/api";

const Landing = () => {
  const oauth = (provider) => {
    window.location.href = `${AUTH_BASE_URL}/api/auth/${provider}`;
  };

  return (
    <div className="landing-page page-fade-in" id="home">
      <Navbar />

      <main className="hero-section">
        <div className="hero-glow" aria-hidden="true" />
        <div className="page hero-content">
          <p className="badge">Secure SaaS authentication</p>
          <h1>Build, deploy, and scale with confidence.</h1>
          <p className="hero-subtext">
            BuildStack gives modern teams secure onboarding, OTP verification, password recovery,
            and social sign-in from day one.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/auth?tab=signup">
              Get Started
            </Link>
            <Link className="btn btn-ghost" to="/auth">
              Sign In
            </Link>
          </div>
          <div className="oauth-grid" style={{ maxWidth: 360, margin: "18px auto 0" }}>
            <button className="btn btn-oauth" type="button" onClick={() => oauth("google")}>
              Continue with Google
            </button>
            <button className="btn btn-oauth" type="button" onClick={() => oauth("github")}>
              Continue with GitHub
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
