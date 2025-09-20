import React from 'react';
import { ArrowRight } from 'lucide-react';
import '../pages/Home/HomePage.css';

const CtaSection = () => {
  return (
    <section className="cta-section section-padding">
      <div className="cta-content">
        <h2 className="cta-title">Ready to Revolutionize Your Reporting?</h2>
        <p className="cta-text">
          Minimize manual effort, enhance accuracy, and gain valuable insights.
          Get started with Reportify today.
        </p>
        <button className="button button-accent button-lg">
          Get a Free Demo <ArrowRight className="icon-right" />
        </button>
      </div>
    </section>
  );
};

export default CtaSection;