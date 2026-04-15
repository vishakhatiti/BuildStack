const Hero = () => {
  return (
    <section className="hero-section" id="home">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-layout animate-in">
        <p className="eyebrow">Built for shipping-focused developers</p>
        <h1 className="hero-title">Manage projects and track every deployment status in one view.</h1>
        <p className="hero-description">
          BuildStack gives engineering teams a single workspace to organize repositories, monitor
          Live, Failed, and In Progress releases, and act quickly with dashboard insights before
          incidents reach users.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary" type="button">
            Open BuildStack
          </button>
          <button className="btn btn-secondary" type="button">
            View Deployment Workflow
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
