import "./HeroSection.css";

function HeroSection() {
  return (
    <header className="hero hero-hybrid">
      <nav className="navbar hero-nav">
        <h1 className="logo">Sahil's Blog</h1>

        <div className="nav-links">
          <a href="#">About</a>
          <a
            href="https://www.linkedin.com/in/sahil-basumatary/"
            target="_blank"
          >
            LinkedIn
          </a>
        </div>
      </nav>

      <div className="hero-content">
        <div className="hero-text">
          <h2 className="hero-title">Namaste </h2>

          <p className="hero-desc">
            Welcome to my blog! Here you will find a journey full of fun experiences, unique catches and just learn what I have learned!
          </p>

          <button className="hero-btn">Start Reading</button>
        </div>

        <div className="hero-image">
          <img src="/images/New-profile-picture.jpeg" alt="Sahil" />
        </div>
      </div>
    </header>
  );
}

export default HeroSection;