import "./HomePage.css";

import HeroSection from "../components/HeroSection";
import CategoriesSection from "../components/CategoriesSection";
import QuoteSection from "../components/QuoteSection";
import SubscribeSection from "../components/SubscribeSection";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <div className="home-container">
      <HeroSection />
      <CategoriesSection />
      <QuoteSection />
      <div className="subscribe-wrapper">
      <SubscribeSection />
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;