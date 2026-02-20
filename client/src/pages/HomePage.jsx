import { Helmet } from "react-helmet-async";
import { SEO } from "../config/seo";
import "./HomePage.css";

import HeroSection from "../components/HeroSection";
import CategoriesSection from "../components/CategoriesSection";
import QuoteSection from "../components/QuoteSection";
import SubscribeSection from "../components/SubscribeSection";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <div className="home-container">
      <Helmet>
        <title>{SEO.siteName}</title>
        <meta
          name="description"
          content="Thoughts on software engineering, system design, and the journey from student to industry — by Sahil Basumatary."
        />
        <link rel="canonical" href={SEO.baseUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={SEO.siteName} />
        <meta
          property="og:description"
          content="Thoughts on software engineering, system design, and the journey from student to industry — by Sahil Basumatary."
        />
        <meta property="og:url" content={SEO.baseUrl} />
        <meta property="og:image" content={SEO.defaultImage} />
        <meta property="og:site_name" content={SEO.siteName} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={SEO.twitterHandle} />
        <meta name="twitter:title" content={SEO.siteName} />
        <meta
          name="twitter:description"
          content="Thoughts on software engineering, system design, and the journey from student to industry — by Sahil Basumatary."
        />
        <meta name="twitter:image" content={SEO.defaultImage} />
      </Helmet>
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