import logoIcon from "../assets/logo-icon.svg";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="page navbar-inner">
        <Link to="/" className="brand" aria-label="BuildStack Home">
          <img src={logoIcon} alt="BuildStack logo" className="brand-logo" />
          <span>BuildStack</span>
        </Link>

        <div className="nav-actions" style={{ marginLeft: "auto" }}>
          <Link to="/auth" className="btn btn-ghost btn-sm">
            Sign In
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
