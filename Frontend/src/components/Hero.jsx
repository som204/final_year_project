import React from 'react';
import { ArrowRight } from 'lucide-react';
import '../pages/Home/HomePage.css';

const Hero = () => {
  return (
    <section className="hero-section section-padding">
      <div className="hero-content">
        <h1 className="hero-headline">
          Streamline Your Institute's Annual Report
        </h1>
        <p className="hero-subheadline">
          Aggregate, analyze, and visualize your institute's data effortlessly.
          Turn complex information into insightful, professional reports with our
          automated portal.
        </p>
        <div className="hero-cta">
          <button className="button button-accent button-lg">
            Request a Demo <ArrowRight className="icon-right" />
          </button>
          <button className="button button-outline button-lg">
            Learn More
          </button>
        </div>
      </div>
       <div className="hero-image-container">
        
      </div>
    </section>
  );
};

export default Hero;