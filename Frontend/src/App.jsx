// src/App.jsx
import React from "react";
import UserRoutes from "./Routes/userRoutes";
import { UserProvider } from "./Context/user.context";
import { BrowserRouter } from "react-router-dom";


import { NotificationProvider } from "./Context/notification.context";

function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <UserRoutes />
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;
