// routes/projects.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const pool = require("../db");
const sendEmail = require("../utils/sendEmail");

// Creator uploads final project
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { proposal_id, description, file_links } = req.body;
    const creator_id = req.user.id;

    // 1. Проверить, что proposal существует и creator_id совпадает
    const proposalResult = await pool.query(
      `SELECT p.*, o.user_id AS client_id, o.title AS order_title
       FROM proposals p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = $1
         AND p.creator_id = $2
         AND p.status = 'Payed'`,
      [proposal_id, creator_id]
    );

    if (proposalResult.rows.length === 0) {
      return res.status(403).json({ message: "Proposal not found or unauthorized" });
    }

    const proposal = proposalResult.rows[0];

    // 2. Создать запись в таблице projects
    const projectResult = await pool.query(
      `INSERT INTO projects (proposal_id, description, file_links)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [proposal_id, description, file_links] // file_links может быть TEXT[], JSONB и т.п.
    );

    const newProject = projectResult.rows[0];

    // 3. Обновить статус proposals -> "Project Ready for Confirmation"
    await pool.query(
      `UPDATE proposals
       SET status = 'Project Ready for Confirmation'
       WHERE id = $1`,
      [proposal_id]
    );

    // 4. Уведомить клиента
    const notificationMessage = `Project files are ready for your order: "${proposal.order_title}".`;
    await pool.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)`,
      [proposal.client_id, notificationMessage]
    );

    // 5. Отправить email клиенту
    const clientEmailResult = await pool.query(
      `SELECT email, name
       FROM users
       WHERE id = $1`,
      [proposal.client_id]
    );
    const { email: clientEmail, name: clientName } = clientEmailResult.rows[0];

    const emailSubject = `Project Ready for Confirmation: "${proposal.order_title}"`;
    const emailBody = `
      <p>Dear ${clientName},</p>
      <p>The creator has uploaded final project files for your order: <strong>${proposal.order_title}</strong>.</p>
      <p>Please log in to confirm or request changes.</p>
      <p>Best regards,<br><strong>Make me reels Team</strong></p>
    `;

    await sendEmail(clientEmail, emailSubject, emailBody);

    // 6. Ответ
    res.status(201).json({ project: newProject, message: "Project uploaded successfully" });
  } catch (err) {
    console.error("Error uploading project:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
