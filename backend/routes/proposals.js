const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const pool = require("../db"); // Import shared pool

router.post('/proposals', authenticateToken, authenticateExecutor, async (req, res) => {
    const { orderId, message, price } = req.body;
    const userId = req.user.userId;
    try {
      const result = await pool.query(
        'INSERT INTO proposals (user_id, order_id, message, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, orderId, message, price]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error submitting proposal:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  module.exports = router;