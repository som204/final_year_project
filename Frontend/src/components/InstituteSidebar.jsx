import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookPlus, UserPlus } from 'lucide-react';
import '../pages/Admin/InstituteAdmin.css';
import { LogOut } from 'lucide-react';

const InstituteSidebar = ({ onLogoutClick }) => {
  return (
    <aside className="ia-sidebar">
      <div className="ia-sidebar-header">
        <h2 className="ia-sidebar-title">Institute Admin</h2>
      </div>
      <nav className="ia-sidebar-nav">
        <NavLink to="/institute-admin/dashboard" className="ia-sidebar-link">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/institute-admin/register-department" className="ia-sidebar-link">
          <BookPlus size={20} />
          <span>Department</span>
        </NavLink>
        <NavLink to="/institute-admin/register-faculty" className="ia-sidebar-link">
          <UserPlus size={20} />
          <span>Faculty</span>
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

export default InstituteSidebar;