import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        BuildStack
      </Link>

      <nav className="nav-links">
        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>
      </nav>

      <div className="nav-actions">
        <Link to="/auth" className="btn btn-ghost">
          Login
        </Link>
        <Link to="/auth?tab=signup" className="btn btn-primary">
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
