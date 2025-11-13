import "./HeroSection.css";

function HeroSection() {
  return (
    <header className="hero">
      <nav className="navbar">
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
        <div className="text-section">
          <h2>Namaste</h2>
          <p>
            Welcome to my blog! Here you will find a journey full of fun
            experiences, unique catches and just learn what I have learned!
          </p>
          <button className="signup-btn">Sign up</button>
        </div>

        <div className="image-section">
          <img
            src="/images/sahil.jpg"
            alt="Sahil"
          />
        </div>
      </div>
    </header>
  );
}

export default HeroSection;