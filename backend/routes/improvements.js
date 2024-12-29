// routes/improvements.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const pool = require("../db");
const sendEmail = require("../utils/sendEmail");

// 1) Получить список improvements для конкретного project
router.get("/project/:projectId", authenticateToken, async (req, res) => {
    const { projectId } = req.params;
  
    try {
      const improvementsResult = await pool.query(
        `SELECT i.*, u.name AS author_name
         FROM improvements i
         JOIN users u ON i.author_id = u.id
         WHERE i.project_id = $1
         ORDER BY i.created_at ASC`,
        [projectId]
      );
  
      // Return improvements in an object with a "improvements" property
      res.status(200).json({
        improvements: improvementsResult.rows, 
      });
    } catch (err) {
      console.error("Error fetching improvements:", err.message);
      res.status(500).json({ message: "Internal server error" });
    }
  });

// 2) Создать новую improvement (комментарий)
router.post("/", authenticateToken, async (req, res) => {
  const { project_id, message } = req.body;
  const author_id = req.user.id;

  if (!project_id || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Проверим, что проект существует
    const projectCheck = await pool.query(
      `SELECT p.proposal_id, pr.creator_id, pr.status AS proposal_status,
              o.user_id AS client_id, o.title AS order_title
       FROM projects p
       JOIN proposals pr ON p.proposal_id = pr.id
       JOIN orders o ON pr.order_id = o.id
       WHERE p.id = $1
    `,
      [project_id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { proposal_id, creator_id, proposal_status, client_id, order_title } =
      projectCheck.rows[0];

    // Добавляем запись в improvements
    const newCommentResult = await pool.query(
      `INSERT INTO improvements (project_id, author_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [project_id, author_id, message]
    );
    const newComment = newCommentResult.rows[0];

    // Определяем роли
    const isCreator = author_id === creator_id;
    const isClient = author_id === client_id;

    /**
     * Логика статусов:
     * Если клиент оставил комментарий => proposals.status = "Need improvements"
     * Если creator оставил комментарий и всё поправил => proposals.status = "Project Ready for Confirmation"
     * И т.д. - на ваше усмотрение, можно тоже передавать status через body
     */

    let newProposalStatus = proposal_status;

    // Примерная логика:
    if (isClient) {
      // Клиент запросил доработки
      newProposalStatus = "Need improvements";
    } else if (isCreator) {
      // Исполнитель, возможно, всё поправил → "Project Ready for Confirmation"
      newProposalStatus = "Project Ready for Confirmation";
    }

    // Обновляем статус proposal (если нужно)
    if (newProposalStatus !== proposal_status) {
      await pool.query(
        `UPDATE proposals SET status = $1 WHERE id = $2`,
        [newProposalStatus, proposal_id]
      );
    }

    // Уведомление для второй стороны
    let notifyUserId = isClient ? creator_id : client_id;
    let notifyMessage = isClient
      ? `Client requested improvements for "${order_title}"`
      : `Creator posted a new comment for "${order_title}"`;

    await pool.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)`,
      [notifyUserId, notifyMessage]
    );

    // Отправка email - опционально
    // ...

    res.status(201).json({ improvement: newComment, proposal_status: newProposalStatus });
  } catch (err) {
    console.error("Error creating improvement:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
