import React from 'react';
import { Building, Users, UserCheck } from 'lucide-react';
import '../pages/Super Admin/SuperAdmin.css'; // CSS for Dashboard

const DashboardPage = () => {
  // Dummy data for statistics
  const stats = {
    totalInstitutes: 15,
    totalStudents: 2345,
    totalViewers: 456,
  };

  // Dummy data for recent institutes
  const recentInstitutes = [
    { name: 'Global Institute of Technology', code: 'GIT', admin: 'john.doe@git.edu' },
    { name: 'National College of Arts', code: 'NCA', admin: 'jane.smith@nca.edu' },
    { name: 'Metro Business School', code: 'MBS', admin: 'sam.wilson@mbs.edu' },
  ];

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="stats-cards-container">
        <div className="stat-card">
          <div className="stat-card-icon institutes">
            <Building size={28} />
          </div>
          <div className="stat-card-info">
            <p>Total Institutes</p>
            <span>{stats.totalInstitutes}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon students">
            <Users size={28} />
          </div>
          <div className="stat-card-info">
            <p>Total Students</p>
            <span>{stats.totalStudents}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon viewers">
            <UserCheck size={28} />
          </div>
          <div className="stat-card-info">
            <p>Total Viewers</p>
            <span>{stats.totalViewers}</span>
          </div>
        </div>
      </div>
      
      {/* Recent Institutes Table */}
      <div className="recent-institutes-container">
        <h2>Recently Added Institutes</h2>
        <table className="recent-institutes-table">
          <thead>
            <tr>
              <th>Institute Name</th>
              <th>Code</th>
              <th>Admin Email</th>
            </tr>
          </thead>
          <tbody>
            {recentInstitutes.map((inst, index) => (
              <tr key={index}>
                <td>{inst.name}</td>
                <td>{inst.code}</td>
                <td>{inst.admin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;