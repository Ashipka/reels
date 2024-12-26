const jwt = require("jsonwebtoken");
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    console.error("Invalid token:", err);
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authenticateToken;