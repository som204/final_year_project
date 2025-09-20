import React from 'react';
import { BookOpenCheck } from 'lucide-react';
import '../pages/Home/HomePage.css';

const Navbar = () => {
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <a href="/" className="logo">
          <BookOpenCheck className="logo-icon" />
          Reportify
        </a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="nav-actions">
          <button className="button button-ghost">Log In</button>
          <button className="button button-primary">Sign Up Free</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;