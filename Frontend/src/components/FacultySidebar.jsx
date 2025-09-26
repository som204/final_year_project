import React,{useContext,useState} from 'react';
import { NavLink,useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload } from 'lucide-react';
import '../pages/Faculty/InstituteFaculty.css';
import { LogOut } from 'lucide-react';

const FacultySidebar = ({ onLogoutClick }) => {
  return (
    <>
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
       <div className="sidebar-footer">
        {/* 2. The button's onClick now calls the prop from the parent */}
        <button className="sidebar-link logout-button" onClick={onLogoutClick}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
        </div>
    </aside>
      </>
  );
};

export default FacultySidebar;