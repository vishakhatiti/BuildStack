import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <header className="navbar" id="home">
      <div className="container navbar-inner">
        <a className="brand" href="#home" aria-label="BuildStack home">
          <span className="brand-dot" />
          BuildStack
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#home">Overview</a>
          <a href="#features">Capabilities</a>
          <a href="#about">Workflow</a>
          <a href="#get-started">Start</a>
        </nav>

        <div className="nav-actions">
          <button
            className="btn btn-theme-icon"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="btn btn-ghost" type="button">
            Sign In
          </button>
          <button className="btn btn-primary" type="button">
            Create Workspace
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
