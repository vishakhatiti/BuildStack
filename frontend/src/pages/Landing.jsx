import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";

const features = [
  {
    icon: "🧠",
    title: "OTP-first security",
    description: "Real email OTP flow with verification and token-based session management.",
  },
  {
    icon: "⚡",
    title: "OAuth ready",
    description: "Continue with Google or GitHub using your deployed backend endpoints.",
  },
  {
    icon: "📊",
    title: "Protected dashboard",
    description: "Authenticated routing, logout controls, and scalable dashboard layout.",
  },
];

const Landing = () => {
  return (
    <div className="landing-page page-fade-in" id="home">
      <Navbar />

      <main className="hero-section">
        <div className="hero-glow" aria-hidden="true" />
        <div className="page hero-content">
          <p className="badge">Production-grade auth for BuildStack</p>
          <h1>Track deployments. Ship faster. Stay in control.</h1>
          <p className="hero-subtext">
            BuildStack gives teams a focused deployment workflow with secure email OTP and OAuth
            auth, so releases move quickly without losing visibility.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/auth?tab=signup">
              Get Started
            </Link>
            <Link className="btn btn-ghost" to="/auth">
              Login
            </Link>
          </div>
        </div>
      </main>

      <section id="features" className="section page">
        <div className="section-heading">
          <p className="section-eyebrow">Core capabilities</p>
          <h2>Everything your team needs to ship with confidence</h2>
          <p>
            BuildStack combines onboarding, OTP authentication, and deployment visibility in one
            clean interface designed for high-velocity product teams.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <Card key={feature.title} as="article" className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="about" className="section muted">
        <div className="page about-panel">
          <h2>Built for modern startup teams</h2>
          <p>
            BuildStack helps engineering teams authenticate securely, monitor release quality, and
            keep every stakeholder aligned from first commit to production.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
