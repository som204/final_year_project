// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import DataUpload from "./pages/DataUpload";
import Register from "./pages/Register";
import FacultyDashboard from "./pages/FacultyDashboard";
import RegisterStaff from "./pages/RegisterStaff";
import RegisterStudent from "./pages/RegisterStudent";
import RegInstitute from "./pages/RegInstitute"; // ✅ corrected: file name should be RegInstitute.jsx

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Default route -> Student Registration */}
        <Route path="/" element={<RegisterStudent />} />

        <Route path="/login" element={<Login />} />
        <Route path="/data-upload" element={<DataUpload />} />
        <Route path="/register" element={<Register />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/register-staff" element={<RegisterStaff />} />
        <Route path="/register-student" element={<RegisterStudent />} />

        {/* ✅ Added Register Institute route */}
        <Route path="/register-institute" element={<RegInstitute />} />
      </Routes>
    </Router>
  );
}

export default App;
