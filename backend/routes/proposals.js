const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const pool = require("../db");

// Creator submits a proposal
router.post("/", authenticateToken, async (req, res) => {
  const { order_id, proposal_message, proposed_price } = req.body;
  const creator_id = req.user.id;

  if (!order_id || !proposal_message || !proposed_price) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO proposals (order_id, creator_id, message, proposed_price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [order_id, creator_id, proposal_message, proposed_price]
    );
    console.log("Proposal inserted:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating proposal:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// Client views proposals for their order
router.get("/order/:orderId", authenticateToken, async (req, res) => {
  const { orderId } = req.params;

  try {
    const result = await pool.query(
      "SELECT p.*, u.name AS creator_name FROM proposals p JOIN users u ON p.creator_id = u.id WHERE p.order_id = $1",
      [orderId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching proposals:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
