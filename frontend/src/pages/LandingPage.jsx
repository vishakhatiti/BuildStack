import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const steps = ["Add Project", "Track Deployment", "Monitor Dashboard"];

const LandingPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    visibility: 0,
    countries: 0,
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
                  users: Math.floor(12000 * progress),
                  visibility: Number((98.9 * progress).toFixed(1)),
                  countries: Math.floor(140 * progress),
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
            <h2>Set up in minutes, monitor forever</h2>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <article
                className="step-card reveal"
                key={step}
                style={{ "--stagger": `${index * 0.1}s` }}
              >
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

      <section className="section reveal">
        <div className="container trust-panel">
          <p className="eyebrow">Trusted by builders</p>
          <h2>Used by developers worldwide</h2>
          <p>
            From solo freelancers to student teams and startup engineers, BuildStack keeps
            deployments reliable and visible.
          </p>
          <div className="trust-metrics reveal" aria-label="Trust metrics">
            <div className="reveal" style={{ "--stagger": "0s" }}>
              <strong>{stats.users > 999 ? `${Math.floor(stats.users / 1000)}K+` : "12K+"}</strong>
              <span>Active users</span>
            </div>
            <div className="reveal" style={{ "--stagger": "0.1s" }}>
              <strong>{stats.visibility > 0 ? `${stats.visibility}%` : "98.9%"}</strong>
              <span>Deployment visibility</span>
            </div>
            <div className="reveal" style={{ "--stagger": "0.2s" }}>
              <strong>{stats.countries > 0 ? `${stats.countries}+` : "140+"}</strong>
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
