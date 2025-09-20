import React from 'react';
import { BookOpenCheck } from 'lucide-react';
import '../pages/Home/HomePage.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <a href="/" className="logo">
            <BookOpenCheck className="logo-icon" />
            Reportify
          </a>
          <p>Automating Institutional Excellence.</p>
        </div>
        <div className="footer-links-container">
          <div className="footer-links">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#">Integrations</a>
            <a href="#">Pricing</a>
            <a href="#">Demo</a>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Reportify. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;