const Hero = () => {
  return (
    <section className="hero-section" id="home">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-layout animate-in">
        <p className="eyebrow">Developer platform for modern teams</p>
        <h1>Build, deploy, and scale with complete release visibility.</h1>
        <p className="hero-description">
          BuildStack gives engineering teams one premium workspace to manage projects, monitor
          deployment health, and ship confidently at startup speed.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary" type="button">
            Get Started
          </button>
          <button className="btn btn-secondary" type="button">
            Continue with Google
          </button>
          <button className="btn btn-ghost" type="button">
            Continue with GitHub
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
