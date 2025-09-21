import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload } from 'lucide-react';
import '../pages/Faculty/InstituteFaculty.css';

const FacultySidebar = () => {
  return (
    <aside className="faculty-sidebar">
      <div className="faculty-sidebar-header">
        <h2 className="faculty-sidebar-title">Faculty Portal</h2>
      </div>
      <nav className="faculty-sidebar-nav">
        <NavLink to="/faculty/dashboard" className="faculty-sidebar-link">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/faculty/upload-data" className="faculty-sidebar-link">
          <Upload size={20} />
          <span>Upload Data</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default FacultySidebar;