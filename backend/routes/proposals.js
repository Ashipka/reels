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

    const { title: orderTitle, email: clientEmail, client_name: clientName, user_id: clientId } =
      orderResult.rows[0];

    // Create a notification for the client
    const notificationMessage = `You have received a new proposal for your order: "${orderTitle}"`;
    await pool.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)`,
      [clientId, notificationMessage]
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
      <p><strong>Make me reels Team</strong></p>
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
  const userId = req.user.id;

  try {
    // Fetch order status and ensure the user owns the order
    const orderResult = await pool.query(
      `SELECT status 
       FROM orders 
       WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    const orderStatus = orderResult.rows[0].status;

    // Fetch proposals for the given order
    const proposalsResult = await pool.query(
      `SELECT p.*, u.name AS creator_name 
       FROM proposals p 
       JOIN users u ON p.creator_id = u.id 
       WHERE p.order_id = $1`,
      [orderId]
    );

    res.status(200).json({
      proposals: proposalsResult.rows,
      status: orderStatus,
    });
  } catch (err) {
    console.error("Error fetching proposals and order status:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Атомарное обновление статуса (Router)
router.put("/:proposalId/status", authenticateToken, async (req, res) => {
  const { proposalId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  console.log("Received status:", status);

  // Набор возможных действий при установке того или иного статуса
  const validStatuses = {
    "Accepted": async (proposal, orderId) => {
      // Update the order's status to 'In Progress'
      await pool.query(
        `UPDATE orders
         SET status = 'In Progress'
         WHERE id = $1`,
        [orderId]
      );

      // Notify the creator
      const creatorResult = await pool.query(
        `SELECT u.email, u.name AS creator_name, o.title AS order_title
         FROM users u
         JOIN proposals p ON u.id = p.creator_id
         JOIN orders o ON p.order_id = o.id
         WHERE p.id = $1`,
        [proposalId]
      );

      if (creatorResult.rows.length === 0) {
        throw new Error("Creator not found");
      }

      const { email: creatorEmail, creator_name: creatorName, order_title: orderTitle } = creatorResult.rows[0];

      const notificationMessage = `Your proposal for the order "${orderTitle}" has been accepted.`;
      await pool.query(
        `INSERT INTO notifications (user_id, message)
         VALUES ($1, $2)`,
        [proposal.creator_id, notificationMessage]
      );

      const emailSubject = `Your Proposal for "${orderTitle}" Was Accepted`;
      const emailBody = `
        <p>Dear ${creatorName},</p>
        <p>Congratulations! Your proposal for the order: <strong>${orderTitle}</strong> has been accepted by the client.</p>
        <p>Please log in to your account to proceed with the next steps.</p>
        <p>Best regards,</p>
        <p><strong>Make me reels Team</strong></p>
      `;

      await sendEmail(creatorEmail, emailSubject, emailBody);
    },
    "Waiting for Payment": async (proposal) => {
      // Notify the client
      const clientResult = await pool.query(
        `SELECT u.email, u.name AS client_name, o.title AS order_title
         FROM users u
         JOIN orders o ON o.user_id = u.id
         WHERE o.id = $1`,
        [proposal.order_id]
      );

      if (clientResult.rows.length === 0) {
        throw new Error("Client not found");
      }

      const { email: clientEmail, client_name: clientName, order_title: orderTitle } = clientResult.rows[0];

      const notificationMessage = `The creator has marked the proposal for your order "${orderTitle}" as "Waiting for Payment".`;
      await pool.query(
        `INSERT INTO notifications (user_id, message)
         VALUES ($1, $2)`,
        [proposal.creator_id, notificationMessage]
      );

      const emailSubject = `Proposal for "${orderTitle}" Updated to "Waiting for Payment"`;
      const emailBody = `
        <p>Dear ${clientName},</p>
        <p>The creator has updated the proposal for your order: <strong>${orderTitle}</strong> to "Waiting for Payment".</p>
        <p>Please log in to your account to proceed with the payment.</p>
        <p>Best regards,</p>
        <p><strong>Make me reels Team</strong></p>
      `;

      await sendEmail(clientEmail, emailSubject, emailBody);
    },
    "Payed": async (proposal) => {
      // Notify the creator that the payment has been received
      const creatorResult = await pool.query(
        `SELECT u.email, u.name AS creator_name, o.title AS order_title
         FROM users u
         JOIN proposals p ON u.id = p.creator_id
         JOIN orders o ON p.order_id = o.id
         WHERE p.id = $1`,
        [proposalId]
      );

      if (creatorResult.rows.length === 0) {
        throw new Error("Creator not found");
      }

      const { email: creatorEmail, creator_name: creatorName, order_title: orderTitle } = creatorResult.rows[0];

      const notificationMessage = `The payment for your proposal for the order "${orderTitle}" has been received.`;
      await pool.query(
        `INSERT INTO notifications (user_id, message)
         VALUES ($1, $2)`,
        [proposal.creator_id, notificationMessage]
      );

      const emailSubject = `Payment Received for Proposal for "${orderTitle}"`;
      const emailBody = `
        <p>Dear ${creatorName},</p>
        <p>We are happy to inform you that the payment for your proposal for the order: <strong>${orderTitle}</strong> has been received.</p>
        <p>Please log in to your account to proceed with delivering the order.</p>
        <p>Best regards,</p>
        <p><strong>Make me reels Team</strong></p>
      `;

      await sendEmail(creatorEmail, emailSubject, emailBody);
    },
  };

  try {
    // 1) Проверяем, валиден ли статус
    if (!Object.keys(validStatuses).includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 2) Атомарное обновление: обновляем статус только если он отличается
    const result = await pool.query(
      `UPDATE proposals
       SET status = $1
       WHERE id = $2
         AND status <> $1
       RETURNING *`,
      [status, proposalId]
    );

    // Если rowCount = 0, значит статус уже был таким
    if (result.rowCount === 0) {
      return res.status(200).json({ message: "Proposal already in the desired status" });
    }

    const updatedProposal = result.rows[0];

    // 3) Авторизация: убеждаемся, что создатель или клиент имеет право
    const isCreator = updatedProposal.creator_id === userId;
    // Проверяем, принадлежит ли заказ клиенту
    const clientCheck = await pool.query(
      `SELECT id FROM orders WHERE id = $1 AND user_id = $2`,
      [updatedProposal.order_id, userId]
    );
    const isClient = clientCheck.rows.length > 0;

    if (!isCreator && !isClient) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    // 4) Вызываем экшен для нового статуса
    await validStatuses[status](updatedProposal, updatedProposal.order_id);

    res.status(200).json({ message: `Proposal status updated to "${status}" successfully` });
  } catch (err) {
    console.error("Error updating proposal status:", err.message);
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
       WHERE p.creator_id = $1
       ORDER BY p.created_at DESC`,
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
      `SELECT p.*, o.user_id AS client_id, o.title AS order_title
       FROM proposals p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = $1 AND p.creator_id = $2`,
      [proposalId, creator_id]
    );

    if (proposalCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Proposal not found or unauthorized" });
    }

    const proposalData = proposalCheck.rows[0];
    const { client_id: clientId, order_title: orderTitle } = proposalData;

    // Update the proposal
    const result = await pool.query(
      `UPDATE proposals
       SET message = $1, proposed_price = $2, delivery_days = $3, created_at = NOW()
       WHERE id = $4 RETURNING *`,
      [proposal_message, proposed_price, delivery_days, proposalId]
    );

    const updatedProposal = result.rows[0];

    // Create a notification for the client
    const notificationMessage = `A proposal for your order: "${orderTitle}" has been updated.`;
    await pool.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)`,
      [clientId, notificationMessage]
    );

    // Fetch client's email
    const clientResult = await pool.query(
      `SELECT email, name FROM users WHERE id = $1`,
      [clientId]
    );

    const { email: clientEmail, name: clientName } = clientResult.rows[0];

    // Send an email notification
    const emailSubject = `Proposal Updated for Your Order: "${orderTitle}"`;
    const emailBody = `
      <p>Dear ${clientName},</p>
      <p>A proposal for your order: <strong>${orderTitle}</strong> has been updated.</p>
      <p><strong>Updated Proposal Details:</strong></p>
      <ul>
        <li>Message: ${proposal_message}</li>
        <li>Proposed Price: $${Number(proposed_price).toFixed(2)}</li>
        <li>Delivery Days: ${delivery_days}</li>
      </ul>
      <p>Please log in to your account to review the updated proposal.</p>
      <p>Best regards,</p>
      <p><strong>Make me reels Team</strong></p>
    `;

    await sendEmail(clientEmail, emailSubject, emailBody);

    res.status(200).json({
      message: "Proposal updated, notification sent, and email delivered",
      proposal: updatedProposal,
    });
  } catch (err) {
    console.error("Error updating proposal or sending notification/email:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
