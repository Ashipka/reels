const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middlewares/authenticateToken");

// Получить список всех категорий
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Создать новую категорию
router.post("/", authenticateToken, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating category:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Получить категорию по ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching category:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Обновить категорию
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  try {
    const result = await pool.query(
      "UPDATE categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating category:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Удалить категорию
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json({ message: "Category deleted successfully." });
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
