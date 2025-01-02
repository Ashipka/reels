const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const pool = require("../db");
const sendEmail = require("../utils/sendEmail");

/**
 * 1) Create a new project
 *    - Tied to a proposal that has status "Payed"
 *    - After creation, update proposals.project_id
 *    - Optionally, update proposals.status => "Project Ready for Confirmation"
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { proposal_id, description, file_links } = req.body;
    const creator_id = req.user.id;

    // Basic validation
    if (!proposal_id) {
      return res.status(400).json({ message: "proposal_id is required" });
    }

    // 1. Ensure the proposal belongs to the creator and status is "Payed"
    const proposalCheck = await pool.query(
      `SELECT p.*, o.user_id AS client_id, o.title AS order_title
       FROM proposals p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = $1
         AND p.creator_id = $2
         AND p.status = 'Payed'`,
      [proposal_id, creator_id]
    );

    if (proposalCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Proposal not found, unauthorized, or not Payed" });
    }

    const proposalData = proposalCheck.rows[0];
    const { client_id, order_title } = proposalData;

    // 2. Create a record in projects
    const projectInsertResult = await pool.query(
      `INSERT INTO projects (proposal_id, description, file_links)
       VALUES ($1, $2, $3)
       RETURNING id, proposal_id, description, file_links`,
      [proposal_id, description, file_links || []]
    );
    const createdProject = projectInsertResult.rows[0];

    // 3. Update the proposals table => set project_id and status => "Project Ready for Confirmation"
    await pool.query(
      `UPDATE proposals
       SET project_id = $1,
           status = 'Project Ready for Confirmation'
       WHERE id = $2`,
      [createdProject.id, proposal_id]
    );

    // 4. Notify client
    const notificationMessage = `Creator uploaded final project files for your order: "${order_title}".`;
    await pool.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)`,
      [client_id, notificationMessage]
    );

    // 5. Optionally, send email to client
    const clientEmailResult = await pool.query(
      `SELECT email, name FROM users WHERE id = $1`,
      [client_id]
    );
    const { email: clientEmail, name: clientName } = clientEmailResult.rows[0];

    const emailSubject = `Project Files Ready: "${order_title}"`;
    const emailBody = `
      <p>Dear ${clientName},</p>
      <p>The creator has uploaded project files for your order: <strong>${order_title}</strong>.</p>
      <p>Please log in to review the files and confirm or request changes.</p>
      <p>Best regards,<br><strong>Make me reels Team</strong></p>
    `;
    await sendEmail(clientEmail, emailSubject, emailBody);

    res.status(201).json({
      message: "Project created and proposal status updated",
      project: createdProject,
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * 2) GET /projects/:proposalId
 *    Fetch project data for reading final files or discussion
 */
router.get("/:proposalId", authenticateToken, async (req, res) => {
  const { proposalId } = req.params;

  try {
    const projectResult = await pool.query(
      `SELECT p.*, pr.status AS proposal_status, pr.creator_id, o.user_id AS client_id, o.title AS order_title
       FROM projects p
       JOIN proposals pr ON p.proposal_id = pr.id
       JOIN orders o ON pr.order_id = o.id
       WHERE pr.id = $1`,
      [proposalId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectData = projectResult.rows[0];
    // Check authorization if needed (client or creator must match)
    // If you want, you can verify:
    //   if (req.user.id !== projectData.creator_id && req.user.id !== projectData.client_id) { ... }

    res.status(200).json({ project: projectData });
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * 3) PUT /projects/:proposalId
 *    (OPTIONAL) Update existing project if you want the creator to upload new version
 */
router.put("/:proposalId", authenticateToken, async (req, res) => {
  const { proposalId } = req.params;
  const { description, file_links } = req.body;
  const userId = req.user.id;

  try {
    // 1. Check ownership
    const projectCheck = await pool.query(
      `SELECT p.*, pr.creator_id, pr.id AS proposal_id, o.title AS order_title, o.user_id AS client_id
       FROM projects p
       JOIN proposals pr ON p.proposal_id = pr.id
       JOIN orders o ON pr.order_id = o.id
       WHERE pr.id = $1`,
      [proposalId]
    );
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectData = projectCheck.rows[0];
    if (projectData.creator_id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 2. Update the project record
    const updateResult = await pool.query(
      `UPDATE projects
       SET description = $1,
           file_links = $2
       WHERE proposal_id = $3
       RETURNING *`,
      [description || projectData.description, file_links || projectData.file_links, proposalId]
    );
    const updatedProject = updateResult.rows[0];

    // 3. If needed, update proposals.status => "Project Ready for Confirmation"
    await pool.query(
      `UPDATE proposals
       SET status = 'Project Ready for Confirmation'
       WHERE id = $1`,
      [projectData.proposal_id]
    );

    // 4. Notify client (optional)
    const notificationMessage = `Creator updated final project files for your order: "${projectData.order_title}".`;
    await pool.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)`,
      [projectData.client_id, notificationMessage]
    );

    // 5. Optionally, send email to client
    const clientEmailResult = await pool.query(
      `SELECT email, name FROM users WHERE id = $1`,
      [projectData.client_id]
    );
    const { email: clientEmail, name: clientName } = clientEmailResult.rows[0];

    const emailSubject = `Project Files Updated: "${projectData.order_title}"`;
    const emailBody = `
      <p>Dear ${clientName},</p>
      <p>The creator has uploaded project files for your order: <strong>${projectData.order_title}</strong>.</p>
      <p>Please log in to review the files and confirm or request changes.</p>
      <p>Best regards,<br><strong>Make me reels Team</strong></p>
    `;
    await sendEmail(clientEmail, emailSubject, emailBody);

    res.status(200).json({ project: updatedProject, message: "Project updated successfully" });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
