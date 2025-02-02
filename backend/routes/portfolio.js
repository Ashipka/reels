const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const authenticateCreator = require("../middlewares/authenticateCreator");
const pool = require("../db"); // Import shared pool

// Создать элемент портфолио
router.post("/", authenticateToken, authenticateCreator, async (req, res) => {
  const { title, description, tags, instagram_link, category_id } = req.body; 
  // ↑ обращаем внимание на category_id
  const userId = req.user.id;

  try {
    // Добавляем category_id в INSERT
    const result = await pool.query(
      `INSERT INTO portfolio (user_id, title, description, tags, instagram_link, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, description, tags, instagram_link, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding portfolio item:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Обновить элемент портфолио по ID
router.put("/:id", authenticateToken, authenticateCreator, async (req, res) => {
  const { id } = req.params; 
  const { title, description, tags, instagram_link, category_id } = req.body; 
  const userId = req.user.id; 

  try {
    // Добавляем category_id в UPDATE
    const result = await pool.query(
      `UPDATE portfolio 
       SET title = $1,
           description = $2,
           tags = $3,
           instagram_link = $4,
           category_id = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, description, tags, instagram_link, category_id, id, userId]
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

// Получить все элементы портфолио для конкретного пользователя
router.get("/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query("SELECT * FROM portfolio WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No portfolio found for this user." });
    }
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching portfolio:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

  router.get("/", async (req, res) => {
    const { categoryId } = req.query;
  
    try {
      let query = `SELECT p.*, u.name as creator_name FROM portfolio p JOIN users u ON p.user_id = u.id`; 
      let values = [];
  
      // Если categoryId есть и оно не пустое — добавляем условие WHERE
      if (categoryId) {
        query += " WHERE category_id = $1";
        values.push(categoryId);
      }
  
      const result = await pool.query(query, values);
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching portfolios:", err.message);
      res.status(500).json({ message: "Failed to load portfolios" });
    }
  });
  

module.exports = router;
