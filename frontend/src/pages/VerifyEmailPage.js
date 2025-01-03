import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/VerifyEmailPage.css"; // Include CSS for styling messages

const VerifyEmailPage = () => {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      verifyEmail(token);
    } else {
      setMessage("Invalid verification link.");
      setIsSuccess(false);
    }
  }, [location]);

  const verifyEmail = async (token) => {
    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${BASE_URL}/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Email verified successfully. You can now log in.");
        setIsSuccess(true);

        if (data.message === "Email verified successfully. You can now log in.") {
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      } else {
        setMessage(data.message || "Failed to verify email.");
        setIsSuccess(false);
      }
    } catch (err) {
      console.error("Error verifying email:", err.message);
      setMessage("An error occurred while verifying your email.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="verify-email-container">
      <h2>Email Verification</h2>
      <div className={`message-box ${isSuccess ? "success" : "error"}`}>
        {message || "Processing your email verification..."}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
