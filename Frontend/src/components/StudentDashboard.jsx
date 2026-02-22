import React from "react";
import { 
  BookOpen, 
  Clock, 
  Award, 
  Calendar,
  Bell,
  Building2
} from "lucide-react";
import '../pages/Student/Student.css';

// --- MOCK DATA ---
const STUDENT_INFO = {
  name: "Alex Johnson",
  id: "ST-2024-001",
  program: "B.Tech Computer Science",
  institute: "Global Institute of Technology"
};

const DASHBOARD_STATS = [
  { id: 1, label: "Attendance", value: "87%", icon: <Clock size={24} />, color: "blue" },
  { id: 2, label: "Current CGPA", value: "8.4", icon: <Award size={24} />, color: "purple" },
  { id: 3, label: "Pending Tasks", value: "03", icon: <BookOpen size={24} />, color: "orange" },
  { id: 4, label: "Events", value: "02", icon: <Calendar size={24} />, color: "green" },
];

const NOTIFICATIONS = [
  { id: 1, text: "New Institute Report: 'Campus Sustainability' is now available.", time: "2 hours ago", type: "report" },
  { id: 2, text: "Assignment 'Data Structures' due tomorrow.", time: "5 hours ago", type: "academic" },
  { id: 3, text: "Guest Lecture on AI scheduled for Friday.", time: "1 day ago", type: "event" },
];

const StudentDashboard = () => {
  return (
    <div>
      {/* Sidebar is rendered by Parent Layout */}
        {/* HEADER CARD */}
        <div className="student-header-card">
          <div className="header-info">
            <h1>Welcome back, {STUDENT_INFO.name}</h1>
            <p>{STUDENT_INFO.program} | ID: {STUDENT_INFO.id}</p>
          </div>
          <div className="institute-badge">
            <Building2 size={18} />
            <span>{STUDENT_INFO.institute}</span>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="student-stats-grid">
          {DASHBOARD_STATS.map((stat) => (
            <div key={stat.id} className={`student-stat-card ${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT ACTIVITY SECTION */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="notifications-list">
            {NOTIFICATIONS.map((notif) => (
              <div key={notif.id} className="notification-item">
                <div className={`notif-icon ${notif.type}`}>
                  <Bell size={18} />
                </div>
                <div className="notif-content">
                  <p>{notif.text}</p>
                  <span>{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
  );
};

export default StudentDashboard;