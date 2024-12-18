const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const pool = require("../db");

// Creator submits a proposal
router.post("/", authenticateToken, async (req, res) => {
  const { order_id, proposal_message, proposed_price, delivery_days } = req.body;
  const creator_id = req.user.id;

  if (!order_id || !proposal_message || !proposed_price || !delivery_days) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO proposals (order_id, creator_id, message, proposed_price, delivery_days)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [order_id, creator_id, proposal_message, proposed_price, delivery_days]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating proposal:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Client views proposals for their order
router.get("/order/:orderId", authenticateToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*, u.name AS creator_name 
       FROM proposals p 
       JOIN users u ON p.creator_id = u.id 
       WHERE p.order_id = $1`,
      [orderId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching proposals:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch all proposals made by the authenticated user (creator)
router.get("/", authenticateToken, async (req, res) => {
  const creator_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT p.*, o.title AS order_title, o.description AS order_description, o.budget AS order_budget
       FROM proposals p
       JOIN orders o ON p.order_id = o.id
       WHERE p.creator_id = $1`,
      [creator_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching user proposals:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a proposal made by the authenticated creator
router.put("/:proposalId", authenticateToken, async (req, res) => {
  const { proposalId } = req.params;
  const creator_id = req.user.id;
  const { proposal_message, proposed_price, delivery_days } = req.body;

  if (!proposal_message || !proposed_price || !delivery_days) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Ensure the proposal belongs to the authenticated user
    const proposalCheck = await pool.query(
      `SELECT * FROM proposals WHERE id = $1 AND creator_id = $2`,
      [proposalId, creator_id]
    );

    if (proposalCheck.rows.length === 0) {
      return res.status(404).json({ message: "Proposal not found or unauthorized" });
    }

    const result = await pool.query(
      `UPDATE proposals
       SET message = $1, proposed_price = $2, delivery_days = $3, created_at = NOW()
       WHERE id = $4 RETURNING *`,
      [proposal_message, proposed_price, delivery_days, proposalId]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating proposal:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
