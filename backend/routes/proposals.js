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
      `INSERT INTO proposals (order_id, creator_id, message, proposed_price, delivery_days, status)
       VALUES ($1, $2, $3, $4, $5, 'Pending') RETURNING *`,
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

// Accept a proposal and update the related order's status
router.put("/:proposalId/accept", authenticateToken, async (req, res) => {
  const { proposalId } = req.params;

  try {
    // Mark the proposal as Accepted
    const proposalResult = await pool.query(
      `UPDATE proposals
       SET status = 'Accepted'
       WHERE id = $1 RETURNING *`,
      [proposalId]
    );

    if (proposalResult.rows.length === 0) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const proposal = proposalResult.rows[0];

    // Update the related order's status
    await pool.query(
      `UPDATE orders
       SET status = 'In Progress'
       WHERE id = $1`,
      [proposal.order_id]
    );

    res.status(200).json({ message: "Proposal accepted and order updated", proposal });
  } catch (err) {
    console.error("Error accepting proposal:", err.message);
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
    const result = await pool.query(
      `UPDATE proposals
       SET message = $1, proposed_price = $2, delivery_days = $3, created_at = NOW()
       WHERE id = $4 AND creator_id = $5 RETURNING *`,
      [proposal_message, proposed_price, delivery_days, proposalId, creator_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Proposal not found or unauthorized" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating proposal:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
