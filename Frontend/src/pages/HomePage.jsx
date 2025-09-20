import React from "react";
import "./HomePage.css";
import Navbar from "../components/Navbar";

function HomePage() {
  return (
    <>
      <Navbar />
      <div className="home-container">
        <header className="hero-section">
          <h1>Annual Report Preparation Portal</h1>
          <p>
            A dynamic and automated system to streamline report preparation,
            minimize manual effort, and provide valuable insights.
          </p>
          <button className="cta-btn">Get Started</button>
        </header>

        <section className="features">
          <div className="feature-card">
            <h2>🔐 Authentication</h2>
            <p>Secure login and role-based access for administrators, faculty, and students.</p>
          </div>
          <div className="feature-card">
            <h2>📊 Data Analysis</h2>
            <p>Interactive dashboards for academic performance, research, and financial insights.</p>
          </div>
          <div className="feature-card">
            <h2>📝 Report Generation</h2>
            <p>Automated reports in PDF/HTML with customizable templates and multimedia support.</p>
          </div>
          <div className="feature-card">
            <h2>🤝 Collaboration</h2>
            <p>Collaborative editing, version control, and stakeholder feedback collection.</p>
          </div>
        </section>

        <footer className="footer">
          <p>© {new Date().getFullYear()} Annual Report Portal. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

export default HomePage;