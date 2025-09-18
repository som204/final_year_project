import React from "react";
import "./FacultyNavbar.css";


export default function Navbar() {
  return (
    <header className="fd-header">
      {/* Left - Logo/Title */}
      <h2>Annual Report Portal</h2>

      {/* Center - Navigation */}
      <nav>
        <a href="#">Home</a>
        <a href="#">Dashboard</a>
        <a href="#">Reports</a>
      </nav>

      {/* Right - Profile + Logout */}
      <div className="fd-profile">
        
        <button className="logout-btn">Logout</button>
      </div>
    </header>
  );
}