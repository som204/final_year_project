import React from "react";
import Login from "./pages/Login";
import Home from "./components/Home";
import DataUpload from "./pages/DataUpload";
import Dashboard from "./components/Dashboard";
import Register from "./pages/Register";
import FacultyDashboard from "./pages/FacultyDashboard";

function App() {
  return (
    <>
      {/* Temporary: Show Dashboard directly */}
      {/* <Home /> */}

      {/* Later, you will show Login first, then after success -> Dashboard */}
       {/* <Login />  */}
       {/* <Signup />  */}
      <DataUpload /> 
      {/* <Dashboard /> */}
      {/* <Register /> */}
      <FacultyDashboard/>
    </>
  );
}

export default App;
