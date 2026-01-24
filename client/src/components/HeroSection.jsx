import "./HeroSection.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { isOwnerUser } from "../config/authOwner";
import UserChip from "./UserChip";

function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  const isOwner = isSignedIn && isOwnerUser(user?.id);

  return (
    <header className="hero hero-hybrid">
      <nav className="navbar hero-nav">
        <h1 className="logo">Sahil Blogs</h1>

        <div className="nav-links desktop-nav">
          <a href="/blog" className="nav-item">
            Blog
          </a>
          <a href="#" className="nav-item">
            About
          </a>
          <a
            href="https://www.linkedin.com/in/sahil-basumatary/"
            target="_blank"
            rel="noreferrer"
            className="nav-item"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/Sahil-Basumatary"
            target="_blank"
            rel="noreferrer"
            className="nav-item"
          >
            GitHub
          </a>

          {isOwner && (
            <Link to="/write" className="nav-item">
              Write
            </Link>
          )}

          <UserChip surface="dark"/>
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
        <a href="/blog" onClick={() => setMenuOpen(false)}>
          Blog
        </a>
        <a href="#" onClick={() => setMenuOpen(false)}>
          About
        </a>
        <a
          href="https://www.linkedin.com/in/sahil-basumatary/"
          target="_blank"
          rel="noreferrer"
          onClick={() => setMenuOpen(false)}
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/Sahil-Basumatary"
          target="_blank"
          rel="noreferrer"
          onClick={() => setMenuOpen(false)}
        >
          GitHub
        </a>
        {isOwner && (
          <Link to="/write" onClick={() => setMenuOpen(false)}>
            Write
          </Link>
        )}
        <div className="mobile-menu-user">
          <UserChip surface="dark" />
        </div>
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <h2 className="hero-title">Namaste </h2>

          <p className="hero-desc">
            Welcome to my blog! Here you will find a journey full of fun
            experiences, unique catches and just learn what I have learned!
          </p>

          <button
            className="hero-btn"
            onClick={() => (window.location.href = "/blog")}
          >
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