const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container hero-layout">
        <div className="hero-copy">
          <p className="eyebrow">Developer platform for modern teams</p>
          <h1>Track Your Projects. Control Your Deployments.</h1>
          <p>
            BuildStack helps developers, students, and freelancers organize projects, monitor
            deployment health, and ship confidently from one premium dashboard.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary" type="button">
              Get Started
            </button>
            <button className="btn btn-secondary" type="button">
              Continue with Google
            </button>
            <button className="btn btn-secondary" type="button">
              Continue with GitHub
            </button>
          </div>
        </div>

        <aside className="dashboard-preview" aria-label="BuildStack dashboard preview">
          <div className="preview-top">
            <span>BuildStack Dashboard</span>
            <span className="status-pill">Live 83%</span>
          </div>

          <div className="preview-grid">
            <div className="stat-card">
              <p>Total Projects</p>
              <strong>48</strong>
            </div>
            <div className="stat-card">
              <p>Live</p>
              <strong className="live">34</strong>
            </div>
            <div className="stat-card">
              <p>Failed</p>
              <strong className="failed">4</strong>
            </div>
            <div className="stat-card">
              <p>In Progress</p>
              <strong className="progress">10</strong>
            </div>
          </div>

          <div className="preview-list">
            <h3>Recent deployments</h3>
            <ul>
              <li>
                <span>portfolio-v2</span>
                <small className="live-dot">Live</small>
              </li>
              <li>
                <span>client-api</span>
                <small className="progress-dot">In Progress</small>
              </li>
              <li>
                <span>student-hub</span>
                <small className="failed-dot">Failed</small>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Hero;
