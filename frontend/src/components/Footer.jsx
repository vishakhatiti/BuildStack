const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a className="brand" href="#home">
          <span className="brand-dot" />
          BuildStack
        </a>

        <nav className="footer-links" aria-label="Footer links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>

        <p>© {new Date().getFullYear()} BuildStack. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
