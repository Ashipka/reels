const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key"); // Replace with your secret key
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    console.error("Invalid token:", err);
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authenticateToken;
