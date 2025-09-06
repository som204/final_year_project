import React from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import DataUpload from "./components/DataUpload";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <>
      {/* Temporary: Show Dashboard directly */}
      {/* <Home /> */}

      {/* Later, you will show Login first, then after success -> Dashboard */}
       {/* <Login />  */}
       {/* <Signup />  */}
      {/* <DataUpload />  */}
      <Dashboard />
    </>
  );
}

export default App;
