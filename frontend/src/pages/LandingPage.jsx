import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";

const steps = ["Add Project", "Track Deployment", "Monitor Dashboard"];

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <Features />

      <section className="section cta-section" id="get-started">
        <div className="container">
          <div className="cta-card">
            <p className="eyebrow">Start building smarter</p>
            <h2>Start managing your projects today</h2>
            <p>Join BuildStack and keep every deployment on track from day one.</p>
            <button className="btn btn-primary" type="button">
              Get Started
            </button>
          </div>
        </div>
      </section>

      <section className="section muted" id="about">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2>Set up in minutes, monitor forever</h2>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <article className="step-card" key={step}>
                <span>Step {index + 1}</span>
                <h3>{step}</h3>
                <p>
                  {index === 0 &&
                    "Create a project workspace and connect your repository in seconds."}
                  {index === 1 &&
                    "Watch each deployment move across Live, Failed, and In Progress states."}
                  {index === 2 &&
                    "Use one dashboard to spot blockers early and keep your releases healthy."}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container trust-panel">
          <p className="eyebrow">Trusted by builders</p>
          <h2>Used by developers worldwide</h2>
          <p>
            From solo freelancers to student teams and startup engineers, BuildStack keeps
            deployments reliable and visible.
          </p>
          <div className="trust-metrics" aria-label="Trust metrics">
            <div>
              <strong>12K+</strong>
              <span>Active users</span>
            </div>
            <div>
              <strong>98.9%</strong>
              <span>Deployment visibility</span>
            </div>
            <div>
              <strong>140+</strong>
              <span>Countries reached</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
