import React, { useState, useEffect, useContext } from 'react';
import { Building, Users, UserCheck } from 'lucide-react';
import '../pages/Super Admin/SuperAdmin.css';

const DashboardPage = () => {
  // 1. Refactored state: The stats object is now three separate state variables
  const [totalInstitutes, setTotalInstitutes] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [recentInstitutes, setRecentInstitutes] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchDashboardData = async () => {

      try {
        const [studentsResponse, institutesResponse] = await Promise.all([
          fetch('http://localhost:8000/user/all', {
            credentials: 'include',
            method: 'GET',
          }),
          fetch('http://localhost:8000/institute/all', {
            credentials: 'include',
            method: 'GET',
          })
        ]);

        if (!studentsResponse.ok || !institutesResponse.ok) {
          throw new Error('Failed to fetch dashboard data.');
        }

        const studentsData = await studentsResponse.json();
        const institutesData = await institutesResponse.json();

        const totalStudentsCount = studentsData.filter(student => {
          return student.role === 'STUDENT';
        }).length;
        const totalInstitutesCount = institutesData.length;

        // Calculate recent institutes (added within last 7 days)
        const now = new Date();
        const recentInstitutesList = institutesData.filter(inst => {
          const createdAt = new Date(inst.created_at);
          const diffInMs = now.getTime() - createdAt.getTime();
          const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
          return diffInDays <= 7;
        });

        setTotalInstitutes(totalInstitutesCount);
        setTotalStudents(totalStudentsCount);
        setRecentInstitutes(recentInstitutesList);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="loading-message">Loading Dashboard...</div>;
  }
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      {/* 3. Update JSX to use the new individual state variables */}
      <div className="stats-cards-container">
        <div className="stat-card">
          <div className="stat-card-icon institutes"><Building size={28} /></div>
          <div className="stat-card-info">
            <p>Total Institutes</p>
            <span>{totalInstitutes}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon students"><Users size={28} /></div>
          <div className="stat-card-info">
            <p>Total Students</p>
            <span>{totalStudents}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon viewers"><UserCheck size={28} /></div>
          <div className="stat-card-info">
            <p>Total Reports</p>
            <span>{totalReports}</span>
          </div>
        </div>
      </div>
      
      {/* Recent Institutes Table (no changes needed here) */}
      <div className="recent-institutes-container">
        <h2>Recently Added Institutes</h2>
        <table className="recent-institutes-table">
          <thead>
            <tr>
              <th>Institute Name</th>
              <th>Code</th>
              <th>Contact Email</th>
            </tr>
          </thead>
          <tbody>
            {recentInstitutes.length > 0 ? (
              recentInstitutes.map((inst) => (
                <tr key={inst.id}>
                  <td>{inst.name}</td>
                  <td>{inst.code}</td>
                  <td>{inst.contact_email || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No recent institutes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;