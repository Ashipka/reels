const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const authenticateCreator = require("../middlewares/authenticateCreator");
const pool = require("../db"); // Import shared pool

// Add a portfolio item
router.post("/", authenticateToken, authenticateCreator, async (req, res) => {
  const { title, description, tags, instagram_link } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO portfolio (user_id, title, description, tags, instagram_link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, description, tags, instagram_link]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding portfolio item:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get portfolio for the logged-in user
router.get('/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;
  
    try {
      const result = await pool.query('SELECT * FROM portfolio WHERE user_id = $1', [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No portfolio found for this user.' });
      }
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Get portfolio for a specific user by ID
router.put("/:id", authenticateToken, authenticateCreator, async (req, res) => {
    const { id } = req.params; // Extract portfolio item ID from URL
    const { title, description, tags, instagram_link } = req.body; // Extract updated fields
    const userId = req.user.id; // Extract the logged-in user's ID from token
  
    try {
      // Check if the portfolio item exists and belongs to the user
      const result = await pool.query(
        `UPDATE portfolio 
         SET title = $1, description = $2, tags = $3, instagram_link = $4 
         WHERE id = $5 AND user_id = $6 
         RETURNING *`,
        [title, description, tags, instagram_link, id, userId] // "id" might be undefined
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Portfolio item not found or unauthorized." });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("Error updating portfolio item:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports = router;
