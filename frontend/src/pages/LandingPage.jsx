import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const workflowSteps = [
  {
    title: "Create a project workspace",
    detail:
      "Connect your repository, assign service ownership, and define release context so every deployment event maps to the right product.",
  },
  {
    title: "Track deployment state transitions",
    detail:
      "Follow every run through In Progress, Live, or Failed status to spot stalled rollouts quickly and unblock releases before sprint deadlines slip.",
  },
  {
    title: "Act from the dashboard",
    detail:
      "Use build health signals and trend summaries to prioritize fixes, communicate release confidence, and keep stakeholders aligned in real time.",
  },
];

const LandingPage = () => {
  const [stats, setStats] = useState({
    statusStates: 0,
    unifiedDashboard: 0,
    setupMinutes: 0,
  });
  const hasAnimatedStats = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");

            if (entry.target.classList.contains("trust-metrics") && !hasAnimatedStats.current) {
              hasAnimatedStats.current = true;
              const duration = 900;
              const start = performance.now();

              const animate = (time) => {
                const progress = Math.min((time - start) / duration, 1);
                setStats({
                  statusStates: Math.floor(3 * progress),
                  unifiedDashboard: Math.floor(1 * progress),
                  setupMinutes: Math.floor(5 * progress),
                });

                if (progress < 1) {
                  requestAnimationFrame(animate);
                }
              };

              requestAnimationFrame(animate);
            }
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -70px 0px",
      }
    );

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((element) => observer.observe(element));

    return () => {
      revealElements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, []);

  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <Features />
      <CTA />

      <section className="section muted reveal" id="about">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2>A release workflow developers can trust every sprint</h2>
            <p className="section-intro">
              BuildStack keeps project context, deployment progression, and operational follow-up in
              a single flow so teams spend less time syncing and more time shipping.
            </p>
          </div>

          <div className="steps-grid">
            {workflowSteps.map((step, index) => (
              <article
                className="step-card reveal"
                key={step.title}
                style={{ "--stagger": `${index * 0.1}s` }}
              >
                <span>Step {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container trust-panel">
          <p className="eyebrow">Operational clarity</p>
          <h2>Built around the metrics engineering teams actually use</h2>
          <p>
            BuildStack is designed to make deployment health obvious: clear status states, one
            shared dashboard, and fast setup for new projects.
          </p>
          <div className="trust-metrics reveal" aria-label="Platform highlights">
            <div className="reveal" style={{ "--stagger": "0s" }}>
              <strong>{stats.statusStates > 0 ? stats.statusStates : 3}</strong>
              <span>Deployment states tracked</span>
            </div>
            <div className="reveal" style={{ "--stagger": "0.1s" }}>
              <strong>{stats.unifiedDashboard > 0 ? stats.unifiedDashboard : 1}</strong>
              <span>Unified dashboard per workspace</span>
            </div>
            <div className="reveal" style={{ "--stagger": "0.2s" }}>
              <strong>{stats.setupMinutes > 0 ? `${stats.setupMinutes} min` : "5 min"}</strong>
              <span>To configure a new project</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
