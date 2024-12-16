import React, { useEffect, useState } from "react";
import "../styles/portfolio.css";

const Portfolio = ({ creatorId, onEdit }) => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${BASE_URL}/portfolio/${creatorId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message || "Failed to fetch portfolio items");
        }

        const data = await response.json();
        setPortfolioItems(data);

        // Trigger Instagram embeds
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPortfolio();
  }, [creatorId]);

  return (
    <div className="portfolio">
      <h2 className="portfolio-title">Portfolio</h2>
      {error && <p className="error-message">{error}</p>}
      {portfolioItems.length === 0 ? (
        <p>No portfolio items yet. Add your first portfolio item!</p>
      ) : (
        <div className="portfolio-grid">
          {portfolioItems.map((item) => (
            <div className="portfolio-card" key={item.id}>
            <h3>{item.title}</h3>
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
            <button className="edit-button" onClick={() => onEdit(item)}>
              Edit
            </button>
          </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
