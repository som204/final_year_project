import React from 'react';
// 1. Import new icons for the new stat cards
import { Book, User, Users, FileUp, FileCheck2 } from 'lucide-react';
import '../pages/Admin/InstituteAdmin.css';

const InstituteDashboard = () => {
  // 2. Add new stats to the dummy data object
  const stats = {
    totalDepartments: 8,
    totalFaculty: 112,
    totalStudents: 1450,
    totalFiles: 254, // New stat
    reportsGenerated: 5, // New stat
  };

  // 3. Add dummy data for the latest uploads list
  const latestUploads = [
    { id: 1, fileName: 'Financial_Summary_Q4.xlsx', project: 'Annual Report 2025', uploadedBy: 'Dr. John Carter', date: '2025-10-03' },
    { id: 2, fileName: 'CSE_Faculty_Achievements.docx', project: 'Annual Report 2025', uploadedBy: 'Dr. Susan Lewis', date: '2025-10-02' },
    { id: 3, fileName: 'Student_Enrollment_Stats.csv', project: 'Annual Report 2025', uploadedBy: 'Dr. Peter Benton', date: '2025-10-01' },
    { id: 4, fileName: 'Research_Grants_H1.pdf', project: 'Mid-Year Review', uploadedBy: 'Dr. Mark Greene', date: '2025-09-30' },
  ];


  return (
    <div className="ia-dashboard-page">
      <h1>Institute Dashboard</h1>
      
      {/* 4. Update the stats container with the new cards */}
      <div className="ia-stats-cards-container">
        {/* Existing Cards */}
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon departments"><Book size={28} /></div>
          <div className="ia-stat-card-info">
            <p>Total Departments</p>
            <span>{stats.totalDepartments}</span>
          </div>
        </div>
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon faculty"><User size={28} /></div>
          <div className="ia-stat-card-info">
            <p>Total Faculty</p>
            <span>{stats.totalFaculty}</span>
          </div>
        </div>
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon students"><Users size={28} /></div>
          <div className="ia-stat-card-info">
            <p>Total Students</p>
            <span>{stats.totalStudents}</span>
          </div>
        </div>

        {/* New Cards */}
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon files"><FileUp size={28} /></div>
          <div className="ia-stat-card-info">
            <p>Files Uploaded</p>
            <span>{stats.totalFiles}</span>
          </div>
        </div>
        <div className="ia-stat-card">
          <div className="ia-stat-card-icon reports"><FileCheck2 size={28} /></div>
          <div className="ia-stat-card-info">
            <p>Reports Generated</p>
            <span>{stats.reportsGenerated}</span>
          </div>
        </div>
      </div>

      {/* 5. Add the new "Latest Data Uploads" section */}
      <div className="ia-recent-activity">
        <h2>Latest Data Submissions</h2>
        <table className="ia-data-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Project / Report Cycle</th>
              <th>Uploaded By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {latestUploads.map((upload) => (
              <tr key={upload.id}>
                <td>{upload.fileName}</td>
                <td>{upload.project}</td>
                <td>{upload.uploadedBy}</td>
                <td>{upload.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstituteDashboard;