const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const pool = require("../db");

// Create an order
router.post("/", authenticateToken, async (req, res) => {
  const { title, description, budget } = req.body;
  const userId = req.user.id; // Extract userId from token

  try {
    const result = await pool.query(
      "INSERT INTO orders (user_id, title, description, budget, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, title, description, budget, "Open"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all orders for a user with proposal count
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT o.*,
              COALESCE((SELECT COUNT(*) FROM proposals p WHERE p.order_id = o.id), 0) AS proposal_count
       FROM orders o
       WHERE o.user_id = $1
       order BY o.created_at DESC`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Cancel an Order
router.put("/cancel/:id", authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id; // Fixed userId from token

  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3 AND status = $4 RETURNING *",
      ["Cancelled", orderId, userId, "Open"]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Unable to cancel order. Either the order does not exist or is already closed." });
    }

    res.status(200).json({ message: "Order cancelled successfully", order: result.rows[0] });
  } catch (err) {
    console.error("Error cancelling order:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all open orders (available for creators)
router.get("/open", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*,
              COALESCE((SELECT COUNT(*) FROM proposals p WHERE p.order_id = o.id), 0) AS proposal_count
       FROM orders o
       WHERE o.status = 'Open'`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching open orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
