import "./HeroSection.css";
import { useState } from "react";
import { Link } from "react-router-dom";

function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="hero hero-hybrid">
      <nav className="navbar hero-nav">
        <h1 className="logo">Sahil's Blog</h1>

        <div className="nav-links desktop-nav">
          <a href="/blog">Blog</a>
          <a href="#" className="nav-item">About</a>
          <a
            href="https://www.linkedin.com/in/sahil-basumatary/"
            target="_blank"
            className="nav-item"
          >
            LinkedIn
          </a>
          <Link to="/write" className="write-btn">Write</Link>
        </div>

        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <a href="#" onClick={() => setMenuOpen(false)}>About</a>
        <a
          href="https://www.linkedin.com/in/sahil-basumatary/"
          target="_blank"
          onClick={() => setMenuOpen(false)}
        >
          LinkedIn
        </a>
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <h2 className="hero-title">Namaste </h2>

          <p className="hero-desc">
            Welcome to my blog! Here you will find a journey full of fun
            experiences, unique catches and just learn what I have learned!
          </p>

          <button className="hero-btn" onClick={() => window.location.href="/blog"}>
            Start Reading
          </button>
        </div>

        <div className="hero-image">
          <img src="/images/New-profile-picture.jpeg" alt="Sahil" />
        </div>
      </div>
    </header>
  );
}

export default HeroSection;