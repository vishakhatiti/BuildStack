const CTA = () => {
  return (
    <section className="section cta-section reveal" id="get-started">
      <div className="container">
        <div className="cta-card reveal">
          <p className="eyebrow">Ready to reduce release guesswork?</p>
          <h2>Use BuildStack to keep every deployment accountable.</h2>
          <p>
            Start with one repository, track status transitions in real time, and give your team a
            shared dashboard for faster incident response and healthier releases.
          </p>
          <button className="btn btn-primary" type="button">
            Start Tracking Deployments
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
