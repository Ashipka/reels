import React, { useState, useEffect } from "react";
import "../styles/explore-creators.css";

const ExploreCreatorsPage = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [category, setCategory] = useState(""); // Filter by category
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPortfolio();
  }, [category]);

  // Dynamically load Instagram embed script and process embeds
  useEffect(() => {
    const loadInstagramScript = () => {
      if (!document.querySelector('script[src="https://www.instagram.com/embed.js"]')) {
        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.onload = () => {
          if (window.instgrm) {
            console.log("Processing Instagram embeds");
            window.instgrm.Embeds.process();
          }
        };
        script.onerror = () => console.error("Failed to load Instagram embed script");
        document.body.appendChild(script);
      } else if (window.instgrm) {
        console.log("Instagram embed script already loaded, processing embeds");
        window.instgrm.Embeds.process();
      }
    };

    if (portfolioItems.length > 0) {
      loadInstagramScript();
    }
  }, [portfolioItems]);

  const fetchPortfolio = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${BASE_URL}/portfolio?category=${category}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to fetch portfolio items");

      const data = await response.json();
      setPortfolioItems(data);
    } catch (err) {
      console.error(err.message);
      setError("Failed to load creators.");
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  return (
    <div className="explore-creators">
      <h2>Explore Creators</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="filters">
        <div className="custom-dropdown-container">
          <select
            name="category"
            value={category}
            onChange={handleCategoryChange}
            className="custom-dropdown"
          >
            <option value="">All Categories</option>
            <option value="reels">Reels</option>
            <option value="short films">Short Films</option>
            <option value="music">Music</option>
          </select>
        </div>
      </div>

      {portfolioItems.length === 0 ? (
        <p>No creators found for the selected category.</p>
      ) : (
        <div className="creators-grid">
          {portfolioItems.map((item) => (
            <div className="creator-card" key={item.id}>
              <h3>{item.creator_name || "Unknown Creator"}</h3>
              <p>{item.title}</p>
              <p>{item.description}</p>
              {item.instagram_link && (
                <div className="instagram-embed">
                  <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={item.instagram_link}
                    data-instgrm-version="14"
                  >
                    <a href={item.instagram_link} target="_blank" rel="noopener noreferrer">
                      View on Instagram
                    </a>
                  </blockquote>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreCreatorsPage;
