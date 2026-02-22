import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, LogOut } from 'lucide-react';
import '../pages/Faculty/InstituteFaculty.css';

const FacultySidebar = ({ onLogoutClick }) => {
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
        {/* NEW REPORT LINK */}
        <NavLink to="/faculty/reports" className="faculty-sidebar-link">
          <FileText size={20} />
          <span>Reports</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-button" onClick={onLogoutClick}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default FacultySidebar;