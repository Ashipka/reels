import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App";

const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev); // Toggle dropdown visibility
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    setUser(null); // Clear user state in context
    navigate("/login"); // Redirect to the login page
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderMenu = () => {
    if (!user) {
      // Unauthenticated user menu
      return (
        <>
          <li>
            <Link to="/explore-creators">Explore Creators</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <span
              onClick={() =>
                navigate("/login", { state: { isSignUp: true } }) // Pass state to open in Sign Up mode
              }
              style={{ cursor: "pointer", fontWeight: "bold" }}
            >
              Register
            </span>
          </li>
        </>
      );
    }

    if (user.role === "creator") {
      // Creator menu
      return (
        <>
          <li>
            <Link to="/opportunities">Opportunities</Link>
          </li>
          <li>
            <Link to="/my-proposals">My Proposals</Link>
          </li>
          <li className="user-menu dropdown">
            <button className="dropdown-button">
              {user.name} ▼
            </button>
            <ul className="dropdown-menu">
              <li>
                <Link to="/portfolio">My Portfolio</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </li>
        </>
      );
    }

    if (user.role === "client") {
      // Client menu
      return (
        <>
          <li>
            <Link to="/explore-creators">Explore Creators</Link>
          </li>
          <li className="dropdown">
            <button className="dropdown-button">
              My Orders ▼
            </button>
            <ul className="dropdown-menu">
              <li>
                <Link to="/view-orders">View Orders</Link>
              </li>
              <li>
                <Link to="/create-order">Create New</Link>
              </li>
            </ul>
          </li>
          <li className="user-menu dropdown">
            <button className="dropdown-button">
              {user.name} ▼
            </button>
            <ul className="dropdown-menu">
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </li>
        </>
      );
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Make me reels</Link>
      </div>
      <nav>
        <ul>{renderMenu()}</ul>
      </nav>
    </header>
  );
};

export default Header;
