import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../App";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext); // Access user from context

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
