import React, {useState , useEffect, useContext } from 'react';
import { Book, User, Users, FileUp, FileCheck2, Loader, AlertCircle } from 'lucide-react';
import '../pages/Admin/InstituteAdmin.css';
import { UserContext } from '../Context/user.context';

const InstituteDashboard = () => {
  // State management for API data, loading, and errors
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [projects, setprojects] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [generatedReports, setGeneratedReports] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, token } = useContext(UserContext);

  // useEffect to fetch all data concurrently when the component mounts
   useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !token) {
        setIsLoading(false);
        setError("Authentication required.");
        return;
      }

      try {
        const [
          departmentsResponse,
          facultyResponse,
          projectsResponse,
          uploadsResponse,
          reportsResponse
        ] = await Promise.all([
          // 1. Fetch Departments
          fetch(`http://localhost:8000/department/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
          }),
          // 2. Fetch Faculty
          fetch(`http://localhost:8000/user/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
            
          }),
          // 3. Fetch projects
          fetch(`http://localhost:8000/projects/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
          }),
          // 4. Fetch Uploaded Files
          fetch(`http://localhost:8000/uploads/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
          }),
          // 5. Fetch Generated Reports
          fetch(`http://localhost:8000/reports/institute/${user.institute_id}`, {
            credentials: 'include',
            method: 'GET',
          })
        ]);

        // Check if any request failed
        if (!departmentsResponse.ok) throw new Error('Failed to fetch departments.');
        if (!facultyResponse.ok) throw new Error('Failed to fetch faculty.');
        if (!projectsResponse.ok) throw new Error('Failed to fetch Projects.');
        if (!uploadsResponse.ok) throw new Error('Failed to fetch uploaded files.');
        if (!reportsResponse.ok) throw new Error('Failed to fetch generated reports.');

        // Parse the JSON for each successful response
        const deptsData = await departmentsResponse.json();
        const facultyData = await facultyResponse.json();
        const projectsData = await projectsResponse.json();
        const uploadsData = await uploadsResponse.json();
        const reportsData = await reportsResponse.json();

        // Update state with the fetched data
        setDepartments(deptsData);
        setFaculty(facultyData);
        setprojects(projectsData);
        setUploadedFiles(uploadsData);
        setGeneratedReports(reportsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);// Re-run this effect if the user or token changes

  // Display a loading message while data is being fetched
  if (isLoading) {
    return (
      <div className="loading-message">
        <Loader className="spinner" /> Loading Dashboard Data...
      </div>
    );
  }

  // Display an error message if the API calls failed
  if (error) {
    return (
      <div className="form-message error">
        <AlertCircle /> {error}
      </div>
    );
  }

  return (
    <div className="ia-dashboard-page">
      <h1>Institute Dashboard of {user.institute_name}</h1>
      
      {/* Key Performance Indicator (KPI) Cards */}
      <div className="ia-stats-cards-container">
        {/* KPIs are calculated directly from the .length of the fetched arrays */}
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon departments"><Book size={28} /></div>
          <div className="ia-stat-card-info">
            <p>Total Departments</p>
            <span>{departments.length}</span>
          </div>
        </div>
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon faculty"><User size={28} /></div>
          <div className="ia-stat-card-info">
            <p>Total Faculty</p>
            <span>{faculty.length}</span>
          </div>
        </div>
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon projects"><Users size={28} /></div>
          <div className="ia-stat-card-info">
            <p>Total projects</p>
            <span>{projects.length}</span>
          </div>
        </div>
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon files"><FileUp size={28} /></div>
          <div className="ia-stat-card-info">
            <p>Files Uploaded</p>
            <span>{uploadedFiles.length}</span>
          </div>
        </div>
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon reports"><FileCheck2 size={28} /></div>
          <div className="ia-stat-card-info">
            <p>Reports Generated</p>
            <span>{generatedReports.length}</span>
          </div>
        </div>
      </div>

      {/* Latest Data Submissions Table */}
      <div className="ia-recent-activity">
        <h2>Latest Data Submissions</h2>
        <table className="ia-data-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Project</th>
              <th>Uploaded By</th>
              <th>Department</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {uploadedFiles.length > 0 ? (
              // --- THIS IS THE FIX ---
              // 1. Create a copy of the array to avoid changing the original state
              [...uploadedFiles]
                // 2. Sort the array by date in descending order (newest first)
                .sort((a, b) => new Date(b.upload_time) - new Date(a.upload_time))
                // 3. Take only the first 5 items from the sorted list
                .slice(0, 5)
                // 4. Map over the final, smaller array to render the table rows
                .map((upload) => (
                  <tr key={upload.id}>
                    <td>{upload.name}</td>
                    <td>{upload.project_name || 'N/A'}</td>
                    <td>{upload.faculty_name || 'N/A'}</td>
                    <td>{upload.department_name || 'N/A'}</td>
                    <td>{new Date(upload.upload_time).toLocaleDateString()}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="4">No files have been uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstituteDashboard;
