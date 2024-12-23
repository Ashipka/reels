const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const pool = require("../db");
const sendEmail = require("../utils/sendEmail"); // Utility to send emails

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

    const proposal = result.rows[0];

    // Fetch client information associated with the order
    const orderResult = await pool.query(
      `SELECT o.title, o.user_id, u.email, u.name AS client_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }


  const { title: orderTitle, email: clientEmail, client_name: clientName } =
      orderResult.rows[0];

    // Create a notification for the client
    const notificationMessage = `You have received a new proposal for your order: "${orderTitle}"`;
    await pool.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)`,
      [orderResult.rows[0].user_id, notificationMessage]
    );

    // Send an email to the client
    const emailSubject = `New Proposal for Your Order: "${orderTitle}"`;
    const emailBody = `
      <p>Dear ${clientName},</p>
      <p>You have received a new proposal for your order: <strong>${orderTitle}</strong>.</p>
      <p><strong>Proposal Details:</strong></p>
      <ul>
        <li>Message: ${proposal_message}</li>
        <li>Proposed Price: $${Number(proposed_price).toFixed(2)}</li>
        <li>Delivery Days: ${delivery_days}</li>
      </ul>
      <p>Please log in to your account to view and manage this proposal.</p>
      <p>Best regards,</p>
      <p><strong>Reels Marketplace Team</strong></p>
    `;

    await sendEmail(clientEmail, emailSubject, emailBody);

    res.status(201).json(proposal);
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
