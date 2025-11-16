import { Link } from "react-router-dom";
import "./CategoriesSection.css";

function CategoriesSection() {
  return (
    <section className="categories">
      <h2 className="section-title">A Window to my Journey</h2>

      <div className="cards">
        <div className="card">
          <Link to="/cs-journey" className="category-card">
            <img src="/icons/cs.png" alt="CS Journey" />
            <p>My CS Journey</p>
          </Link>
        </div>

        <div className="card">
          <Link to="/life-in-london" className="category-card">
            <img src="/icons/london.png" alt="Life in London" />
            <p>Life in London from a coder's perspective</p>
          </Link>
        </div>

        <div className="card">
          <Link to="/motivation" className="category-card">
            <img src="/icons/motivation.png" alt="Motivation" />
            <p>A personal touch — inspiration and motivation</p>
          </Link>
        </div>

        <div className="card">
          <Link to="/tools" className="category-card">
            <img src="/icons/tools.png" alt="Tools" />
            <p>Useful tools and resources for coders and students</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CategoriesSection;