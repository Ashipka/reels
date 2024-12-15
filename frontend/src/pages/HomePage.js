import React, { useContext } from "react";
import { UserContext } from "../App";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { user } = useContext(UserContext); // Access user context

  return (
    <div className="homepage">
      <h1>Welcome to Reels Marketplace</h1>
      <p>
        Looking to bring your brand to life with high-quality Instagram Reels?
        You're in the right place! Connect with talented creators who can make
        your vision a reality.
      </p>
      <div className="cta-section">
        {!user && ( // Show the "Get Started" button only if user is NOT logged in
          <Link to="/login" className="cta-button">
            Get Started
          </Link>
        )}
        <Link to="/dashboard" className="cta-button">
          Explore Dashboard
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
