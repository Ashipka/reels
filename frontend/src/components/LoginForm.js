import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App"; // Import UserContext

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For sign up only
  const [role, setRole] = useState("client"); // Default role: Client
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and sign up
  const { setUser } = useContext(UserContext); // Access setUser from context
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsSignUp((prev) => !prev);
    setError(""); // Reset error message when toggling
  };

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    const endpoint = isSignUp ? "register" : "login"; // Use different endpoints
    const body = isSignUp
      ? JSON.stringify({ name, email, password, role }) // Include role for registration
      : JSON.stringify({ email, password }); // For login

    try {
      const response = await fetch(`${BASE_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const { token, name: userName, role: userRole, id: userId } = await response.json(); // Retrieve token, name, and role
      localStorage.setItem("token", token); // Save the JWT token in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ name: userName, role: userRole, id: userId })
      ); // Save user details to localStorage
      setUser({ name: userName, role: userRole, id: userId }); // Update UserContext with the user's name and role
      navigate(userRole === "client" ? "/dashboard" : "/creator-dashboard"); // Redirect based on role
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
      <p>
        {isSignUp
          ? "Already have an account?"
          : "Don't have an account yet?"}{" "}
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
