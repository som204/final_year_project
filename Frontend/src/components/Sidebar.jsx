import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building } from 'lucide-react';
import '../../src/pages/Super Admin/SuperAdmin.css'; // CSS for Sidebar

const Sidebar = () => {
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
          <span>Register Institute</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;