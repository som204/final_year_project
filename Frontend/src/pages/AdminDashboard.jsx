import React from "react";
import "./AdminDashboard.css";
import Navbar from "../components/Navbar";

function Dashboard() {
  return (
    <div className="dashboard">
      <Navbar />

      {/* Welcome Section */}
      <div className="welcome-section">
        <h2>Welcome to Annual Report Portal</h2>
        <p>
          Streamline your institution’s annual report preparation with
          comprehensive data management, collaboration tools, and automated
          reporting features.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="card">
          <h3>11</h3>
          <p>Active Reports</p>
        </div>
        <div className="card">
          <h3>12</h3>
          <p>Total Departments</p>
        </div>
        <div className="card">
          <h3>180</h3>
          <p>Faculty Members</p>
        </div>
        <div className="card">
          <h3>3200</h3>
          <p>Students Enrolled</p>
        </div>
      </div>

      {/* Add Department & Faculty Section */}
      <div className="manage-section">
        <div className="manage-card">
          <h3>Add Department</h3>
          <p>Create a new department and manage departmental information.</p>
          <button>Add Department</button>
        </div>

        <div className="manage-card">
          <h3>Add Faculty</h3>
          <p>Register a new faculty member and manage faculty records.</p>
          <button>Add Faculty</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;