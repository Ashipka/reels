import React, { useEffect, useState } from "react";
import PortfolioForm from "./PortfolioForm"; // Import the new form component

const Portfolio = ({ creatorId, onEdit }) => {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [error, setError] = useState("");
  
    useEffect(() => {
      const fetchPortfolio = async () => {
        try {
          const BASE_URL = process.env.REACT_APP_BASE_URL;
          const response = await fetch(`${BASE_URL}/portfolio/${creatorId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
  
          if (!response.ok) {
            const { message } = await response.json();
            throw new Error(message);
          }
  
          const data = await response.json();
          setPortfolioItems(data);
        } catch (err) {
          setError(err.message);
        }
      };
  
      fetchPortfolio();
    }, [creatorId]);
  
    return (
      <div className="portfolio">
        <h2>Portfolio</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {portfolioItems.length === 0 ? (
          <p>No portfolio items yet. Add your first portfolio item!</p>
        ) : (
          <ul>
            {portfolioItems.map((item) => (
              <li key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {item.instagram_link && (
                  <a href={item.instagram_link} target="_blank" rel="noopener noreferrer">
                    View on Instagram
                  </a>
                )}
                <button onClick={() => onEdit(item)}>Edit</button> {/* Pass full item */}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
export default Portfolio;
