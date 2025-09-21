import React from 'react';
import { Outlet } from 'react-router-dom';
import FacultySidebar from '../../components/FacultySidebar';
import './InstituteFaculty.css'; // New dedicated CSS file

const InstituteFaculty = () => {
  return (
    <div className="faculty-layout">
      <FacultySidebar />
      <main className="faculty-content">
        <Outlet />
      </main>
    </div>
  );
};

export default InstituteFaculty;