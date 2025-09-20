import React from 'react';
import { Outlet } from 'react-router-dom';
import InstituteSidebar from '../../components/InstituteSidebar';
import './InstituteAdmin.css'; // New dedicated CSS file

const InstituteAdmin = () => {
  return (
    <div className="ia-layout">
      <InstituteSidebar />
      <main className="ia-content">
        <Outlet />
      </main>
    </div>
  );
};

export default InstituteAdmin;