import React from "react";
import "./FacultyNavbar.css";


export default function Navbar() {
  return (
    <header className="fd-header">
      {/* Left - Logo/Title */}
      <h2>Annual Report Portal</h2>

      {/* Center - Navigation */}
     <div className="nav-right">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/academics">Academics</a>
         <a href="/training&placement">Training & Placement</a>
         <a href="/noticeboard">Notice</a>
         <a href="/profile">Profile</a>
  
      </div>

      {/* Right - Profile + Logout */}
      <div className="fd-profile">
        
        <button className="logout-btn">Logout</button>
      </div>
    </header>
  );
}