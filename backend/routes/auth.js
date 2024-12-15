const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Import shared pool

const router = express.Router();

// Secret key for JWT
const SECRET_KEY = 'your_secret_key';

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role }, // Include role in JWT payload
      "your_secret_key",
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

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role]
    );

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

router.post('/register-creator', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'creator']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error registering creator:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
