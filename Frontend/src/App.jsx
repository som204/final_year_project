import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import DataUpload from "./pages/DataUpload";
import Register from "./pages/Register";
import FacultyDashboard from "./pages/FacultyDashboard";
import RegisterStaff from "./pages/RegisterStaff";
import RegisterStudent from "./pages/RegisterStudent";
import RegInstitute from "./pages/RegInstitute";
import ProtectedRoute from "./components/ProtectedRoute";
import { getCurrentUser } from "./api/userApi";

function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch role to decide default route
  useEffect(() => {
    const fetchRole = async () => {
      const user = await getCurrentUser();
      setRole(user?.role || "student");
      setLoading(false);
    };
    fetchRole();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Default route based on role */}
        <Route
          path="/"
          element={role === "admin" ? <RegInstitute /> : <RegisterStudent />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/data-upload" element={<DataUpload />} />
        <Route path="/register" element={<Register />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/register-staff" element={<RegisterStaff />} />
        <Route path="/register-student" element={<RegisterStudent />} />

        {/* Admin only route */}
        <Route
          path="/register-institute"
          element={
            <ProtectedRoute adminOnly={true}>
              <RegInstitute />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
