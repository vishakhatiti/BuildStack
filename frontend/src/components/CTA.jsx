import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="section" id="get-started">
      <div className="container">
        <div className="cta-card">
          <p className="badge">Get started</p>
          <h2>Start managing your projects today.</h2>
          <p>
            Create your workspace, onboard your team, and bring every deployment decision into one
            premium dashboard experience.
          </p>
          <Link className="btn btn-primary" to="/auth?tab=signup">
            Start with BuildStack
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
