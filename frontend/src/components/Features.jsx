const featureItems = [
  {
    icon: "⚡",
    title: "Realtime Project Visibility",
    description:
      "Monitor deployment states and project progress in one view so teams can react quickly and ship with confidence.",
  },
  {
    icon: "🧩",
    title: "Unified Workflow",
    description:
      "Manage repositories, owners, and release details in a structured workspace built for engineering execution.",
  },
  {
    icon: "📈",
    title: "Actionable Insights",
    description:
      "Get clear performance signals from your dashboard to spot blockers, reduce failed releases, and improve throughput.",
  },
];

const Features = () => {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-heading">
          <p className="badge">Features</p>
          <h2>Everything needed to run a high-performing product team.</h2>
          <p className="section-intro">
            BuildStack combines clean UX and practical workflow tooling so your team can make
            better delivery decisions.
          </p>
        </div>

        <div className="features-grid">
          {featureItems.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
