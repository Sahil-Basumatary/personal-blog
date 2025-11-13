function HeroSection() {
  return (
    <header className="hero">
      <div className="hero-left">
        <h1 className="hero-title">Namaste</h1>
        <p className="hero-subtitle">
          Welcome to my blog! Here you'll find a journey full of fun experiences,
          unique catches and just learn what I have learned!
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
  );
}

export default HeroSection;