import React, { useState, useEffect, useContext } from 'react';
import { FileText, FolderGit2, FileCheck2 } from 'lucide-react';
import '../pages/Faculty/InstituteFaculty.css';
import { UserContext } from '../Context/user.context';

const FacultyDashboard = () => {
  // State for each statistic
  const [uploadsCount, setUploadsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  
  // State for the list of active projects to display in the table
  const [activeProjects, setActiveProjects] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useContext(UserContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setIsLoading(false);
        setError("Authentication required.");
        return;
      }
      try {
        // 1. Fetch the FULL LISTS for uploads, projects, and reports concurrently
        const [uploadsRes, projectsRes, reportsRes] = await Promise.all([
          fetch(`http://localhost:8000/uploads/${user.id}`, { // Fetches the user's uploaded files list
            credentials: 'include',
            method: 'GET',
          }),
          fetch(`http://localhost:8000/projects/institute/${user.institute_id}`, { // Fetches the user's projects list
            credentials: 'include',
            method: 'GET',
          }),
          fetch(`http://localhost:8000/reports/institute/${user.institute_id}`, { // Fetches the all reports list
            credentials: 'include',
            method: 'GET',
          })
        ]);

        if (!uploadsRes.ok || !projectsRes.ok || !reportsRes.ok) {
          throw new Error('Failed to fetch dashboard data.');
        }

        const uploadsData = await uploadsRes.json();
        const projectsData = await projectsRes.json();
        const reportsData = await reportsRes.json();

        // 2. Calculate counts from the length of the returned arrays
        setUploadsCount(uploadsData.length);
        setReportsCount(reportsData.length);

        // 3. Filter the full projects list to find and count the "ONGOING" ones
        const ongoingProjects = projectsData.filter(project => project.status === 'ONGOING');
        setProjectsCount(projectsData.length);
        setActiveProjects(ongoingProjects); // Set the list for the table

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (isLoading) {
    return <div className="loading-message">Loading Dashboard...</div>;
  }
  if (error) {
    return <div className="form-message error">{error}</div>;
  }

  return (
    <div className="faculty-dashboard-page">
      <h1>Welcome, {user?.full_name || 'Faculty Member'}</h1>
      <p className="dashboard-subheading">Department of {user?.dept_name || 'your department'}</p>
      
      {/* Stat cards now use the counts calculated on the frontend */}
      <div className="faculty-stats-cards-container">
        <div className="faculty-stat-card">
          <div className="faculty-stat-card-icon uploads"><FileText size={28} /></div>
          <div className="faculty-stat-card-info">
            <p>My Total Uploads</p>
            <span>{uploadsCount}</span>
          </div>
        </div>
        <div className="faculty-stat-card">
          <div className="faculty-stat-card-icon projects"><FolderGit2 size={28} /></div>
          <div className="faculty-stat-card-info">
            <p>Total Institute Projects</p>
            <span>{projectsCount}</span>
          </div>
        </div>
        <div className="faculty-stat-card">
          <div className="faculty-stat-card-icon reports"><FileCheck2 size={28} /></div>
          <div className="faculty-stat-card-info">
            <p>Total Reports Generated</p>
            <span>{reportsCount}</span>
          </div>
        </div>
      </div>
      
      {/* The Active Projects table remains the same, using the filtered list */}
      <div className="recent-uploads-container">
        <h2>Total Active Projects</h2>
        <table className="ia-data-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Start Date</th>
            </tr>
          </thead>
          <tbody>
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>
                    <span className={`status-badge status-${project.status.toLowerCase()}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{new Date(project.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">You have no active projects.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyDashboard;