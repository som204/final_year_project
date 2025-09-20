import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookPlus, UserPlus } from 'lucide-react';
import '../pages/Admin/InstituteAdmin.css';

const InstituteSidebar = () => {
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
          <span>Register Department</span>
        </NavLink>
        <NavLink to="/institute-admin/register-faculty" className="ia-sidebar-link">
          <UserPlus size={20} />
          <span>Register Faculty</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default InstituteSidebar;