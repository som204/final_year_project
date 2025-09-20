// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import HomePage from "./pages/Home/HomePage";
import Register from "../src/pages/Register";
import SuperAdmin from "./pages/Super Admin/SuperAdmin";
import DashboardPage from "./components/DashboardPage";
import InstituteRegPage from "./components/InstituteRegPage";
import InstituteAdminLayout from "./pages/Admin/InstituteAdmin";
import InstituteDashboard from "./components/InstituteDashboard";
import DeptRegPage from "./components/DeptRegPage";
import FacultyRegPage from "./components/FacultyRegPage";
import { Navigate } from "react-router-dom";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<SuperAdmin />}>
          {/* The index route redirects /admin to /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="register-institute" element={<InstituteRegPage />} />
        </Route>
         <Route path="/institute-admin" element={<InstituteAdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<InstituteDashboard />} />
          <Route path="register-department" element={<DeptRegPage />} />
          <Route path="register-faculty" element={<FacultyRegPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
