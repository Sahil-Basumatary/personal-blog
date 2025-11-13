function CategoriesSection() {
  return (
    <section className="categories">
      <h2 className="section-title">A Window to my Journey</h2>

      <div className="cards">
        <div className="card">
          <img src="/icons/cs.png" alt="CS Journey" />
          <p>My CS Journey</p>
        </div>

        <div className="card">
          <img src="/icons/london.png" alt="Life in London" />
          <p>Life in London from a coder’s perspective</p>
        </div>

        <div className="card">
          <img src="/icons/motivation.png" alt="Motivation" />
          <p>A personal touch — inspiration and motivation</p>
        </div>

        <div className="card">
          <img src="/icons/tools.png" alt="Tools" />
          <p>Useful tools and resources for coders and students</p>
        </div>
      </div>
    </section>
  );
}

export default CategoriesSection;