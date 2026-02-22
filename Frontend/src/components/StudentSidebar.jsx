import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, UploadCloud, LogOut } from 'lucide-react';
import '../pages/Student/Student.css'; // Assuming you have specific styles for the student sidebar

const StudentSidebar = ({ onLogoutClick }) => {
  return (
    <aside className="student-sidebar">
      <div className="student-sidebar-header">
        <h2 className="student-sidebar-title">Student Portal</h2>
      </div>
      <nav className="student-sidebar-nav">
        <NavLink to="/student/dashboard" className="student-sidebar-link">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        {/* VIEW ONLY REPORTS */}
        <NavLink to="/student/reports" className="student-sidebar-link">
          <FileText size={20} />
          <span>Institute Reports</span>
        </NavLink>

        {/* NEW UPLOAD DATA TAB */}
        {/* <NavLink to="/student/upload" className="student-sidebar-link">
          <UploadCloud size={20} />
          <span>Upload Data</span>
        </NavLink> */}
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

export default StudentSidebar;