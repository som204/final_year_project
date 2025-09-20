import React from "react";
import Navbar from "../../components/Navbar";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  return (
    <div>
      <Navbar />

      <div className="container">
        <h1>Welcome to Annual Report Portal</h1>
        <p>
          Streamline your institution's annual report preparation with
          comprehensive data management, collaboration tools, and automated
          reporting features.
        </p>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">11 <br /> Active Reports</div>
          <div className="stat-card">12 <br /> Total Departments</div>
          <div className="stat-card">180 <br /> Faculty Members</div>
          <div className="stat-card">3200 <br /> Students Enrolled</div>
        </div>

        {/* Recent Activities */}
        <div className="section">
          <h3>Recent Activities</h3>
          <ul>
            <li>Computer Science Department submitted Q4 Report – Prof. Michael Davis</li>
            <li>New research publication added – Dr. Sarah Johnson</li>
            <li>Student achievement data uploaded – Alex Chen</li>
            <li>Annual budget report approved – Admin Office</li>
          </ul>
        </div>

        {/* Upcoming Deadlines */}
        <div className="section">
          <h3>Upcoming Deadlines</h3>
          <ul>
            <li>Final Report Submission – 2024-01-31 (11 days left)</li>
            <li>Research Data Verification – 2024-02-15 (26 days left)</li>
            <li>Annual Review Meeting – 2024-02-28 (39 days left)</li>
          </ul>
        </div>

        {/* This Year’s Achievements */}
        <div className="section">
          <h3>This Year’s Achievements</h3>
          <ul>
            <li>Research Publications: 245</li>
            <li>Student Achievements: 156</li>
            <li>Active Faculty: 180</li>
            <li>Enrolled Students: 3200</li>
          </ul>
        </div>

        {/* System Status */}
        <div className="section">
          <h3>System Status</h3>
          <ul>
            <li>✅ All systems operational</li>
            <li>✅ Data backup completed</li>
            <li>⚙ Scheduled maintenance Feb 25</li>
            <li>✅ Security scan passed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;