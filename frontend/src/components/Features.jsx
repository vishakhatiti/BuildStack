const featureItems = [
  {
    icon: "PR",
    title: "Project Registry",
    description:
      "Create a workspace per product, attach repository URLs, and keep owners, priorities, and release scope visible for every build cycle.",
  },
  {
    icon: "DS",
    title: "Deployment Status Board",
    description:
      "Track each release as Live, Failed, or In Progress so engineers can triage blockers immediately instead of chasing status in chat.",
  },
  {
    icon: "DI",
    title: "Dashboard Insights",
    description:
      "See success rate trends, stalled deployments, and current throughput in one dashboard to make data-backed shipping decisions.",
  },
  {
    icon: "AL",
    title: "Actionable Alerts",
    description:
      "Surface failed or long-running deployments early, helping teams resolve risk before customers notice downtime or broken releases.",
  },
];

const Features = () => {
  return (
    <section className="section reveal" id="features">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Core capabilities</p>
          <h2>Everything your team needs to ship reliably</h2>
          <p className="section-intro">
            BuildStack focuses on release execution: project context, deployment state visibility,
            and operational insights that reduce uncertainty across every sprint.
          </p>
        </div>

        <div className="features-grid">
          {featureItems.map((feature, index) => (
            <article
              className="feature-card reveal"
              key={feature.title}
              style={{ "--stagger": `${index * 0.1}s` }}
            >
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
