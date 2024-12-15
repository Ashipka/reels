const authenticateToken = require("./authenticateToken");

const authenticateCreator = (req, res, next) => {
  // Ensure the user is authenticated
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === "creator") {
      next(); // Proceed if the role is 'creator'
    } else {
      res.status(403).json({ message: "Access denied. Not a creator." });
    }
  });
};

module.exports = authenticateCreator;
