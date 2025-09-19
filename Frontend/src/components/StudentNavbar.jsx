import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2>Annual Report Portal</h2>
      </div>
      <div className="nav-right">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/academics">Academics</a>
         <a href="/training&placement">Training & Placement</a>
         <a href="/noticeboard">Notice</a>
         <a href="/profile">Profile</a>
  
      </div>
    </nav>
  );
};

export default Navbar;