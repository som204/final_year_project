import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../Context/user.context'

const Protected_route = () => {
  const { token,isAuthenticated,isLoading } = useContext(UserContext);
    console.log(isAuthenticated,token,isLoading);
  if (!isLoading) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default Protected_route;