import { Link } from "react-router-dom";
import OAuthButton from "../components/ui/OAuthButton";
import logoIcon from "../assets/logo-icon.svg";
import logoFull from "../assets/logo-full.svg";

const GOOGLE_OAUTH_URL = "https://buildstack-kmdz.onrender.com/api/auth/google";
const GITHUB_OAUTH_URL = "https://buildstack-kmdz.onrender.com/api/auth/github";

const Landing = () => {
  return (
    <div className="app-shell page-fade-in">
      <header className="navbar">
        <div className="page navbar-inner">
          <Link to="/" className="brand" aria-label="BuildStack Home">
            <img src={logoIcon} alt="BuildStack logo" className="brand-logo" />
            <span>BuildStack</span>
          </Link>

          <nav className="nav-actions" aria-label="Primary navigation">
            <Link to="/auth?tab=signup" className="btn btn-primary btn-sm">
              Get Started
            </Link>
            <Link to="/auth" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="hero-section page">
        <section className="hero-card">
          <img src={logoFull} alt="BuildStack" className="hero-brand-logo" />
          <p className="hero-kicker">Build software with confidence</p>
          <h1>One secure workspace for teams shipping fast.</h1>
          <p className="hero-subtext">
            BuildStack gives modern product teams a reliable control center for planning, delivery,
            and authentication that scales with your growth.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/auth?tab=signup">
              Get Started
            </Link>
            <Link className="btn btn-secondary" to="/auth">
              Sign In
            </Link>
          </div>

          <div className="auth-divider" role="separator" aria-label="or continue with">
            <span>or continue with</span>
          </div>

          <div className="oauth-grid">
            <OAuthButton provider="google" onClick={() => (window.location.href = GOOGLE_OAUTH_URL)}>
              Continue with Google
            </OAuthButton>
            <OAuthButton provider="github" onClick={() => (window.location.href = GITHUB_OAUTH_URL)}>
              Continue with GitHub
            </OAuthButton>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
