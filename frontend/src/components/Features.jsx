const featureItems = [
  {
    icon: "📁",
    title: "Project Management",
    description: "Keep every build organized with tags, owners, deadlines, and source links.",
  },
  {
    icon: "🚀",
    title: "Deployment Tracking",
    description: "Track status in real time and instantly know what is Live, Failed, or In Progress.",
  },
  {
    icon: "📊",
    title: "Dashboard Insights",
    description: "Get clear metrics that show delivery speed, success rates, and team activity.",
  },
  {
    icon: "✨",
    title: "Clean UI/UX",
    description: "Focus on shipping with a fast, distraction-free interface made for builders.",
  },
];

const Features = () => {
  return (
    <section className="section reveal" id="features">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Features</p>
          <h2>Everything you need to ship with confidence</h2>
        </div>

        <div className="features-grid">
          {featureItems.map((feature) => (
            <article className="feature-card reveal" key={feature.title}>
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
