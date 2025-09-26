import React from 'react';
import { BrowserRouter, Routes,Route } from 'react-router-dom';
import Login from '../pages/Login/Login';
import HomePage from '../pages/Home/HomePage';
import Register from '../pages/Register/Register';
import SuperAdmin from '../pages/Super Admin/SuperAdmin';
import DashboardPage from '../components/DashboardPage';
import InstituteRegPage from '../components/InstituteRegPage';
import InstituteAdminLayout from '../pages/Admin/InstituteAdmin';
import InstituteDashboard from '../components/InstituteDashboard';
import DeptRegPage from '../components/DeptRegPage';
import FacultyRegPage from '../components/FacultyRegPage';
import FacultyLayout from '../pages/Faculty/InstituteFaculty';
import FacultyDashboard from '../components/FacultyDashboard';
import DataUploadPage from '../components/DataUpload';
import { Navigate } from 'react-router-dom';
import Protected_route from '../Authentication/Protected_route';

// Import your user-related pages/components

const UserRoutes = () => (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Protected_route />}>
              <Route path="/admin" element={<SuperAdmin />}>
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
            <Route path="/faculty" element={<FacultyLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="upload-data" element={<DataUploadPage />} />
            </Route>
        </Route>
        <Route path="*" element={<Login/>} />
      </Routes>
    </BrowserRouter>
);

export default UserRoutes;