import { Link } from "react-router-dom";
import "./CategoriesSection.css";

function CategoriesSection() {
  return (
    <section className="categories">
      <h2 className="section-title">A Window to my Journey</h2>

      <div className="cards">
        <div className="card">
          <Link to="/cs-journey" className="category-card">
            <img src="/icons/coding.svg" alt="CS Journey" />
          </Link>
          <p className="card-text">My CS Journey</p>
        </div>

        <div className="card">
          <Link to="/life-in-london" className="category-card">
            <img src="/icons/londontube.svg" alt="Life in London" />
          </Link>
          <p className="card-text">Life in London from a coder's perspective</p>
        </div>

        <div className="card">
          <Link to="/motivation" className="category-card">
            <img src="/icons/personallife.svg" alt="Motivation" />
          </Link>
          <p className="card-text">A personal touch, inspiration and motivation</p>
        </div>

        <div className="card">
          <Link to="/tools" className="category-card">
            <img src="/icons/programming-tools.svg" alt="Tools" />
          </Link>
          <p className="card-text">Useful tools and resources for coders and students</p>
        </div>
      </div>
    </section>
  );
}

export default CategoriesSection;