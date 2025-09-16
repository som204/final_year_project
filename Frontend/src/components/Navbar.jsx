import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Left side - Logo */}
      <div className="logo">Annual Report Portal</div>

      {/* Center - Nav Links */}
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/upload">Upload Data</a></li>
        <li><a href="/reports">Reports</a></li>
      </ul>

      {/* Right side - Profile */}
      <div className="profile">
        <img
          src="https://via.placeholder.com/35"
          alt="Profile"
          className="profile-img"
        />
        <span className="profile-text">Profile</span>
      </div>
    </nav>
  );
};

export default Navbar;