const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const pool = require("../db"); // Import your DB connection

// Create an order
router.post("/", authenticateToken, async (req, res) => {
  const { title, description, budget } = req.body;
  const userId = req.user.id; // Extract userId from middleware

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

// Get all orders for a user
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Cancel an Order
router.put("/cancel/:id", authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.userId; // Get user ID from token

  try {
    // Update the order status to 'Cancelled'
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3 AND status = $4 RETURNING *",
      ["Cancelled", orderId, userId, "Open"]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Unable to cancel order" });
    }

    res.status(200).json({ message: "Order cancelled successfully", order: result.rows[0] });
  } catch (err) {
    console.error("Error cancelling order:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;