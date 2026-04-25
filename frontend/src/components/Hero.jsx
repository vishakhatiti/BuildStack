import logoFull from "../assets/logo-full.svg";
const Hero = () => {
  return (
    <section className="hero-section premium-hero" id="home">
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-orb" aria-hidden="true" />

      <div className="container hero-layout hero-enter">
        <img src={logoFull} alt="BuildStack" className="hero-brand-logo" />
        <p className="eyebrow">Built for shipping-focused developers</p>
        <h1 className="hero-title">
          Manage projects and track every <span>deployment status</span> in one view.
        </h1>
        <p className="hero-description">
          BuildStack gives engineering teams a single workspace to organize repositories, monitor
          Live, Failed, and In Progress releases, and act quickly with dashboard insights before
          incidents reach users.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" type="button">
            Get Started
          </button>
          <button className="btn btn-secondary btn-lg" type="button">
            Sign In
          </button>
        </div>

        <p className="trust-line">Trusted by developers building modern apps</p>
      </div>
    </section>
  );
};

export default Hero;
