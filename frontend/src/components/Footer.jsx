const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a className="brand" href="#home">
          <span className="brand-dot" />
          BuildStack
        </a>

        <p>© {new Date().getFullYear()} BuildStack. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
