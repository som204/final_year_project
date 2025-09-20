import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import './SuperAdmin.css'; // New CSS file for the entire admin section

const SuperAdmin = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <Outlet /> {/* Child pages will be rendered here */}
      </main>
    </div>
  );
};

export default SuperAdmin;