import "./HomePage.css";

function HomePage() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-left">
          <h1 className="hero-title">Namaste</h1>
          <p className="hero-subtitle">
            Welcome to my blog! Here you'll find fun experiences, lessons, and
            all that I’m learning along the way.
          </p>
          <button className="hero-btn">Sign up</button>
        </div>

        <div className="hero-right">
          <img
            src="/images/profile.png"
            alt="Sahil Basumatary"
            className="hero-img"
          />
        </div>
      </header>

      {/* Categories Section */}
      <section className="categories">
        <h2 className="section-title">A Window to my Journey</h2>

        <div className="cards">
          <div className="card" onClick={() => (window.location.href = "/blog/cs-journey")}>
            <img src="/icons/cs.png" alt="CS Journey" />
            <p>My CS Journey</p>
          </div>

          <div className="card" onClick={() => (window.location.href = "/blog/london")}>
            <img src="/icons/london.png" alt="Life in London" />
            <p>Life in London from a coder's perspective</p>
          </div>

          <div className="card" onClick={() => (window.location.href = "/blog/motivation")}>
            <img src="/icons/motivation.png" alt="Motivation" />
            <p>A personal touch — inspiration & motivation</p>
          </div>

          <div className="card" onClick={() => (window.location.href = "/blog/tools")}>
            <img src="/icons/tools.png" alt="Tools" />
            <p>Useful tools & resources for coders and students</p>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <p className="quote">
          “If she values you and your time, no effort will be required.  
          If she doesn't care about your presence and time, no amount of effort will change that.”
        </p>
      </section>

      {/* Subscribe Section */}
      <section className="subscribe">
        <h3>Be a part of my journey!</h3>
        <p>
          Get updates when I share something new — reflections, lessons, and
          small victories along the way.
        </p>

        <div className="subscribe-btns">
          <button className="sub-btn">Subscribe</button>
          <button
            className="linkedin-btn"
            onClick={() =>
              window.open("https://www.linkedin.com/in/sahilbasumatary", "_blank")
            }
          >
            Connect with me on LinkedIn
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Built, Designed and Maintained by Sahil Basumatary</p>
        <p>© 2025 Sahil's Blog</p>
      </footer>
    </div>
  );
}

export default HomePage;