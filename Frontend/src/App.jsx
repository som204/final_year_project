// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import DataUpload from "./pages/DataUpload";
import Dashboard from "./components/Dashboard";
import Register from "./pages/Register";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdmin from "./pages/SuperAdmin";


function App() {
  return (
    <Router>
      <Routes>
        {/* Default route -> Student Registration */}
        <Route path="/" element={<RegisterStudent />} />

        <Route path="/login" element={<Login />} />
        <Route path="/data-upload" element={<DataUpload />} />
        <Route path="/register" element={<Register />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/register-staff" element={<RegisterStaff />} />
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/super-admin" element={<SuperAdmin />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
