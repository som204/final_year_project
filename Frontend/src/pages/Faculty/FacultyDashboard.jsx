import React from "react";
import Navbar from "../../components/Navbar";
import "./FacultyDashboard.css";

export default function FacultyDashboard() {
  return (
    <div className="faculty-dashboard">
      {/* Navbar */}
      <Navbar />

      {/* Main Grid Layout */}
      <div className="fd-grid">
        {/* LEFT MAIN CONTENT */}
        <main className="fd-main">
          {/* Quick Actions */}
          <section className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button>My Dashboard</button>
              <button>Upload Data</button>
              <button>View Reports</button>
              <button>Schedule</button>
            </div>
          </section>

          {/* Progress Overview */}
          <section className="progress-overview">
            <h3>Report Progress Overview</h3>
            <p>Overall Progress: 78% (35 of 45 reports completed)</p>
            <div className="progress-item">
              <p>Data Collection: 87%</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: "87%" }}></div>
              </div>
            </div>
            <div className="progress-item">
              <p>Final Reviews: 45%</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: "45%" }}></div>
              </div>
            </div>
          </section>

          {/* Activities & Deadlines */}
          <section className="activities-deadlines">
            <div className="activities">
              <h3>Recent Activities</h3>
              <ul>
                <li>Computer Science Department submitted Q4 Report</li>
                <li>Mechanical Department updated data</li>
                <li>Annual budget report approved</li>
              </ul>
            </div>
            <div className="deadlines">
              <h3>Upcoming Deadlines</h3>
              <ul>
                <li>Final Report Submission: Jan 31</li>
                <li>Annual Review Meeting: Jan 28</li>
                <li>Research Data Verification: Ongoing</li>
              </ul>
            </div>
          </section>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="fd-sidebar">
          <div className="stat-box">
            <h2>11</h2>
            <p>Active Reports</p>
          </div>
          <div className="stat-box">
            <h2>12</h2>
            <p>Total Departments</p>
          </div>
          <div className="stat-box">
            <h2>180</h2>
            <p>Faculty Members</p>
          </div>
          <div className="stat-box">
            <h2>3200</h2>
            <p>Students Enrolled</p>
          </div>
        </aside>
      </div>
    </div>
  );
}  