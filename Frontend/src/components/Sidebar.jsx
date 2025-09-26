import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building } from "lucide-react";
import "../../src/pages/Super Admin/SuperAdmin.css"; // CSS for Sidebar
import { LogOut } from "lucide-react";

const Sidebar = ({ onLogoutClick }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Super Admin</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className="sidebar-link">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/register-institute" className="sidebar-link">
          <Building size={20} />
          <span>Institute</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        {/* 2. The button's onClick now calls the prop from the parent */}
        <button className="sidebar-link logout-button" onClick={onLogoutClick}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
