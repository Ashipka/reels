const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const portfolioRoutes = require("./routes/portfolio");
const proposalRoutes = require("./routes/proposals");
const stripeRoutes = require("./routes/stripe");
const projects = require("./routes/projects");
const improvements = require("./routes/improvements");
const categories = require("./routes/categories");

const app = express();

// Define allowed origins
const allowedOrigins = [
  "http://192.168.34.5:3000",
  "http://localhost:3000",
  "https://make-me-reels-ca5bad2c4b7f.herokuapp.com",
  "http://makemereels.com",
  "https://makemereels.com"
];

// CORS middleware configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies or credentials
  })
);

// Handle preflight OPTIONS requests globally
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

// Middleware for JSON parsing
app.use(bodyParser.json());

// API Routes
app.use("/auth", authRoutes); // Auth routes
app.use("/orders", orderRoutes); // Order routes
app.use("/portfolio", portfolioRoutes); // Portfolio routes
app.use("/proposals", proposalRoutes); // Proposals routes
app.use("/api/stripe", stripeRoutes); // Stripe routes
app.use("/projects", projects); // Projects routes
app.use("/improvements", improvements); // Improvements routes
app.use("/categories", categories); // Categories routes
// Serve React static files
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Fallback route for React frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
