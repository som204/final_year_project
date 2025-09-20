import React from 'react';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Features from '../../components/Features';
import CtaSection from '../../components/CtaSection';
import Footer from '../../components/Footer';
import './HomePage.css'; // Your custom styles

const HomePage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;