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
    <>
      {/* Temporary: Show Dashboard directly */}
     

      {/* Later, you will show Login first, then after success -> Dashboard */}
       {/* <Login />  */}
            
      
       {/* <Signup />  */}
      {/* <DataUpload />  */}
      {/* <Dashboard /> */}
      {/* <Register /> */}
      {/* <FacultyDashboard/> */}
      {/* <StudentDashboard/> */}
      {/* <AdminDashboard/> */}
      {/* <HomePage/> */}
      <SuperAdmin/>
    </>
  );
}

export default App;
