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
import ProjectManagementPage from '../components/ProjectManagement';
import ReportManagement from '../components/ReportManagement';
import ReportComponent from '../components/Charts/ReportComponent';
import DepartmentManagementSuperAdmin from '../components/DepartmentManagementSuperAdmin';
import UserManagementSuperAdmin from '../components/UserManagementSuperAdmin';
import AnalyticsPage from '../components/AnalyticsPage';
import FacultyReports from '../components/FacultyReports';
import Student from '../pages/Student/Student';
import StudentDashboard from '../components/StudentDashboard';
import StudentReports from '../components/StudentReports';
import StudentUpload from '../components/StudentUpload';
import StudentManagement from '../components/StudentManagement';
import FullPageEditor from '../components/FullPageEditor';
import NotificationList from '../pages/Notifications/NotificationList';
import NotificationCreate from '../pages/Notifications/NotificationCreate';
// import UserManagementPage from '../components/UserManagementPage';

// Import your user-related pages/components

const UserRoutes = () => (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report" element={<ReportComponent />} />
        <Route path="/institute-admin/report/edit/:id" element={<FullPageEditor />} />
        <Route element={<Protected_route />}>
              <Route path="/admin" element={<SuperAdmin />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="register-institute" element={<InstituteRegPage />} />
              <Route path="departments" element={<DepartmentManagementSuperAdmin />} />
              <Route path="users" element={<UserManagementSuperAdmin />} />
              <Route path="notifications" element={<NotificationList />} />
              <Route path="notifications/create" element={<NotificationCreate />} />
              
            </Route>
            <Route path="/institute-admin" element={<InstituteAdminLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<InstituteDashboard />} />
              <Route path="department" element={<DeptRegPage />} />
              <Route path="faculty" element={<FacultyRegPage />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="project" element={<ProjectManagementPage />} />
              <Route path="report" element={<ReportManagement />} />
              <Route path="analyse" element={<AnalyticsPage/>} />
              <Route path="notifications" element={<NotificationList />} />
              <Route path="notifications/create" element={<NotificationCreate />} />
             
            </Route>
            <Route path="/faculty" element={<FacultyLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="upload-data" element={<DataUploadPage />} />
              <Route path="reports" element={<FacultyReports />} />
              <Route path="notifications" element={<NotificationList />} />
              <Route path="notifications/create" element={<NotificationCreate />} />
            </Route>
            <Route path="/student" element={<Student />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="reports" element={<StudentReports />} />
              <Route path="upload" element={<StudentUpload />} />
              <Route path="notifications" element={<NotificationList />} />
            </Route>   
        </Route>
        <Route path="*" element={<Login/>} />
      </Routes>
    </BrowserRouter>
);

export default UserRoutes;