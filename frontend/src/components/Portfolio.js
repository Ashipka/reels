import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/portfolio.css";

const Portfolio = ({ onEdit }) => {
  const { creatorId: urlCreatorId } = useParams(); // creatorId из URL
  const user = JSON.parse(localStorage.getItem("user")); // Текущий пользователь из localStorage
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [error, setError] = useState("");

  // Определение creatorId (используем из URL или из user.id для creator)
  const creatorId = urlCreatorId || user?.id;

  // Определяем, является ли текущий пользователь владельцем портфолио
  const isCreator = user?.id === creatorId;

  // Fetch portfolio items
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
      } catch (err) {
        setError(err.message);
      }
    };

    if (creatorId) {
      fetchPortfolio();
    } else {
      setError("Creator ID is missing. Please log in or try again.");
    }
  }, [creatorId]);

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

    loadInstagramScript();
  }, [portfolioItems]);

  return (
    <div className="portfolio">
      <h2 className="portfolio-title">Portfolio</h2>
      {error && <p className="error-message">{error}</p>}
      {portfolioItems.length === 0 ? (
        <p>No portfolio items found.</p>
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
              {/* Show Edit button only for the creator */}
              {isCreator && (
                <button className="edit-button" onClick={() => onEdit(item)}>
                  Edit
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
