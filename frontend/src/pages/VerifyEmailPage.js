import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      verifyEmail(token);
    } else {
      alert("Invalid verification link.");
    }
  }, [location]);

  const verifyEmail = async (token) => {
    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${BASE_URL}/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        alert("Email verified successfully!");
        navigate("/login");
      } else {
        alert(data.message || "Failed to verify email.");
      }
    } catch (err) {
      console.error("Error verifying email:", err.message);
      alert("An error occurred while verifying your email.");
    }
  };

  return <div>Verifying email...</div>;
};

export default VerifyEmailPage;
