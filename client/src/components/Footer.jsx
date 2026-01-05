import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p className="footer-credit">
        Built, Designed and Maintained by Sahil Basumatary
      </p>
      <p className="footer-copyright">
        Copyright © {currentYear} Sahil Basumatary. All rights reserved.
      </p>
      <p className="footer-license">
        Source code viewable for learning purposes only. Not licensed for copying or commercial use.
      </p>
    </footer>
  );
}

export default Footer;