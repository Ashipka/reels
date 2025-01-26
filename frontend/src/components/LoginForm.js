import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../App";

const LoginForm = () => {
  const location = useLocation(); // To access passed state
  const [isSignUp, setIsSignUp] = useState(location.state?.isSignUp || false); // Initialize based on state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For sign-up only
  const [role, setRole] = useState("client"); // Default role: Client
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Success message
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    setIsSignUp(location.state?.isSignUp || false); // Update based on location state
  }, [location.state]);

  const handleToggle = () => {
    setIsSignUp((prev) => !prev);
    setError("");
    setSuccessMessage("");
  };

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message
    setSuccessMessage(""); // Reset success message

    const endpoint = isSignUp ? "register" : "login"; // Use different endpoints
    const body = isSignUp
      ? JSON.stringify({ name, email, password, role }) // Include role for registration
      : JSON.stringify({ email, password }); // For login

    try {
      const response = await fetch(`${BASE_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred.");
      }

      if (isSignUp) {
        // Notify user about email verification
        setSuccessMessage(
          "Registration successful! Please check your email to activate your account."
        );
      } else {
        // Handle login success
        const { token, name: userName, role: userRole, id: userId } = data;
        localStorage.setItem("token", token); // Save the JWT token in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({ name: userName, role: userRole, id: userId })
        ); // Save user details to localStorage
        setUser({ name: userName, role: userRole, id: userId }); // Update UserContext
        navigate(userRole === "client" ? "/dashboard" : "/creator-dashboard"); // Redirect based on role
      }
    } catch (err) {
      setError(err.message); // Display error message
    }
  };

  return (
    <div className="login-register">
      <h2>{isSignUp ? "Sign Up for an Account" : "Login to Your Account"}</h2>
      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label>
              <span>Select Role:</span>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="client">Client</option>
                <option value="creator">Creator</option>
              </select>
            </label>
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isSignUp ? "Sign Up" : "Login"}</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <p>
        {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
        <span
          onClick={handleToggle}
          style={{ color: "#4a90e2", cursor: "pointer", fontWeight: "bold" }}
        >
          {isSignUp ? "Login here" : "Sign up here"}
        </span>
      </p>
    </div>
  );
};

export default LoginForm;
