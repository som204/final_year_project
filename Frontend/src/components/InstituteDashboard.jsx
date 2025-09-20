import React from 'react';
import { Book, User, Users } from 'lucide-react';
import '../pages/Admin/InstituteAdmin.css';

const InstituteDashboard = () => {
  // Dummy data for institute-specific stats
  const stats = {
    totalDepartments: 8,
    totalFaculty: 112,
    totalStudents: 1450,
  };

  return (
    <div className="ia-dashboard-page">
      <h1>Institute Dashboard</h1>
      
      <div className="ia-stats-cards-container">
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon departments">
            <Book size={28} />
          </div>
          <div className="ia-stat-card-info">
            <p>Total Departments</p>
            <span>{stats.totalDepartments}</span>
          </div>
        </div>
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon faculty">
            <User size={28} />
          </div>
          <div className="ia-stat-card-info">
            <p>Total Faculty</p>
            <span>{stats.totalFaculty}</span>
          </div>
        </div>
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon students">
            <Users size={28} />
          </div>
          <div className="ia-stat-card-info">
            <p>Total Students</p>
            <span>{stats.totalStudents}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;