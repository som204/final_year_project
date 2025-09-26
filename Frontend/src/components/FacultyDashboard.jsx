import React,{useContext} from 'react';
import { FileText, FolderGit2, Bell } from 'lucide-react';
import '../pages/Faculty/InstituteFaculty.css'; // Reuse the faculty CSS for consistent styling
import { UserContext } from '../Context/user.context';

const FacultyDashboard = () => {
  const { user } = useContext(UserContext);
  // Dummy data for a logged-in faculty member
  const facultyInfo = {
    name: user.full_name,
    department: user.dept_name,
  };
  
  const stats = {
    uploads: 28,
    projects: 4,
    notifications: 3,
  };

  const recentUploads = [
    { name: 'AI_Research_Paper_Q3.pdf', date: '2025-09-20' },
    { name: 'Machine_Learning_Dataset.zip', date: '2025-09-18' },
    { name: 'Semester_VI_Grades.xlsx', date: '2025-09-15' },
  ];

  return (
    <div className="faculty-dashboard-page">
      <h1>Welcome, {facultyInfo.name}</h1>
      <p className="dashboard-subheading">Department of {facultyInfo.department}</p>
      
      {/* Stats Cards */}
      <div className="faculty-stats-cards-container">
        <div className="faculty-stat-card">
          <div className="faculty-stat-card-icon uploads"><FileText size={28} /></div>
          <div className="faculty-stat-card-info">
            <p>Total Uploads</p>
            <span>{stats.uploads}</span>
          </div>
        </div>
        <div className="faculty-stat-card">
          <div className="faculty-stat-card-icon projects"><FolderGit2 size={28} /></div>
          <div className="faculty-stat-card-info">
            <p>Active Projects</p>
            <span>{stats.projects}</span>
          </div>
        </div>
        <div className="faculty-stat-card">
          <div className="faculty-stat-card-icon notifications"><Bell size={28} /></div>
          <div className="faculty-stat-card-info">
            <p>Notifications</p>
            <span>{stats.notifications}</span>
          </div>
        </div>
      </div>
      
      {/* Recent Uploads Table */}
      <div className="recent-uploads-container">
        <h2>Recent Uploads</h2>
        <table className="recent-uploads-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Upload Date</th>
            </tr>
          </thead>
          <tbody>
            {recentUploads.map((upload, index) => (
              <tr key={index}>
                <td>{upload.name}</td>
                <td>{upload.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyDashboard;