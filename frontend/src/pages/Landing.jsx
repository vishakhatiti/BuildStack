import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Landing = () => {
  return (
    <div className="page landing-page" id="home">
      <Navbar />

      <main className="hero">
        <p className="badge">Production-grade Auth for BuildStack</p>
        <h1>Ship secure OTP + OAuth authentication in minutes.</h1>
        <p>
          Modern, responsive, and clean authentication experience with email OTP, Google and GitHub OAuth,
          protected routes, and real backend integration.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/auth?tab=signup">
            Get Started
          </Link>
          <Link className="btn btn-ghost" to="/auth">
            Login
          </Link>
        </div>
      </main>

      <section id="features" className="section">
        <h2>Features</h2>
        <div className="feature-grid">
          <article>
            <h3>OTP-first security</h3>
            <p>Real email OTP flow with verification and token-based session management.</p>
          </article>
          <article>
            <h3>OAuth ready</h3>
            <p>Continue with Google or GitHub using your deployed backend endpoints.</p>
          </article>
          <article>
            <h3>Protected dashboard</h3>
            <p>Authenticated routing, logout controls, and scalable dashboard layout.</p>
          </article>
        </div>
      </section>

      <section id="about" className="section muted">
        <h2>About BuildStack</h2>
        <p>BuildStack helps teams launch and manage projects with secure, seamless onboarding.</p>
      </section>
    </div>
  );
};

export default Landing;
