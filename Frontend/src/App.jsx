// src/App.jsx
import React from "react";
import UserRoutes from "./Routes/userRoutes";
import { UserProvider } from "./Context/user.context";


function App() {
  return (
    <UserProvider>
      <UserRoutes />
    </UserProvider>
  );
}

export default App;
