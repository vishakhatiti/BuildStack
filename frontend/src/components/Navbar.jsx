import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="page navbar-inner">
        <Link to="/" className="brand" aria-label="BuildStack Home">
          <span className="brand-dot" aria-hidden="true" />
          BuildStack
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <Link to="/auth" className="btn btn-ghost btn-sm">
            Login
          </Link>
          <Link to="/auth?tab=signup" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
