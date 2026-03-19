import React from 'react';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Features from '../../components/Features';
import Pricing from '../../components/Pricing';
import Contact from '../../components/Contact';
import CtaSection from '../../components/CtaSection';
import Footer from '../../components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Contact />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;