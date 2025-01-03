const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Import shared pool
const authenticateToken = require('../middlewares/authenticateToken');
const sendEmail = require("../utils/sendEmail"); // Utility to send emails
const crypto = require("crypto");
require('dotenv').config();

const router = express.Router();


// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const user = userResult.rows[0];
    if (!user.verified) {
      return res.status(403).json({ message: "Please verify your email to log in." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role }, // Include role in JWT payload
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, name: user.name, role: user.role, id: user.id }); // Include role in response
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Register route
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate role
  if (!["client", "creator"].includes(role)) {
    return res.status(400).json({ message: "Invalid role selected." });
  }

  const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (emailCheck.rows.length > 0) {
    return res.status(400).json({ message: "Email already exists" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Insert user into the database
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, verification_token, verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role",
      [name, email, hashedPassword, role, verificationToken, false]
    );

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailSubject = `Verify your email`;
    const emailBody = `
      <p>Hi ${name},</p>
      <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail(email, emailSubject, emailBody);

    // Respond with the newly created user
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error during registration:", err);

    // Handle duplicate email error
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email already exists." });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    // Find user by token
    const user = await pool.query("SELECT id FROM users WHERE verification_token = $1", [token]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Mark user as verified
    await pool.query(
      "UPDATE users SET verified = true, verification_token = null WHERE id = $1",
      [user.rows[0].id]
    );

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("Error verifying email:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

// router.post('/register-creator', async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await pool.query(
//       'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
//       [name, email, hashedPassword, 'creator']
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Error registering creator:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

router.get("/verify-token", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});

module.exports = router;
