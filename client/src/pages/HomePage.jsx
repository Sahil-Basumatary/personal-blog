import { SEOHead } from "../components/SEOHead";
import { JsonLd } from "../components/JsonLd";
import { websiteSchema, personSchema } from "../config/structuredData";
import "./HomePage.css";

import HeroSection from "../components/HeroSection";
import CategoriesSection from "../components/CategoriesSection";
import QuoteSection from "../components/QuoteSection";
import SubscribeSection from "../components/SubscribeSection";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <div className="home-container">
      <SEOHead
        description="Thoughts on software engineering, system design, and the journey from student to industry — by Sahil Basumatary."
        url="/"
      />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={personSchema()} />
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