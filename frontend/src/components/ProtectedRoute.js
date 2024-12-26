import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../App";

const ProtectedRoute = ({ children }) => {
  const { setUser } = useContext(UserContext);
  const [isValidToken, setIsValidToken] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      // If no token at all, mark invalid and stop
      if (!token) {
        setIsValidToken(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/auth/verify-token`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          // Token is valid
          setIsValidToken(true);
        } else {
          // Token is invalid or expired
          setIsValidToken(false);

          // Clear storage and reset user in context
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        setIsValidToken(false);

        // Clear storage and reset user in context
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    verifyToken();
  }, [setUser]);

  // 1) While we're verifying the token, show a loading indicator
  if (isValidToken === null) {
    return <div>Loading...</div>;
  }

  // 2) If the token is invalid (or missing), redirect to /login
  if (!isValidToken) {
    return <Navigate to="/login" replace />;
  }

  // 3) If the token is valid, render the protected children
  return children;
};

export default ProtectedRoute;
