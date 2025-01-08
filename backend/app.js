const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Authentication routes
const orderRoutes = require('./routes/orders'); // Order routes
const portfolioRoutes = require("./routes/portfolio"); 
const proposalRoutes = require("./routes/proposals");
const stripeRoutes = require("./routes/stripe");
const projects = require("./routes/projects");
const improvements = require("./routes/improvements");


const app = express();

// Serve React static files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Fallback for React routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const cors = require('cors');
app.use(cors({ origin: "*" }));

app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes); // Auth routes
app.use('/orders', orderRoutes); // Order routes
app.use("/portfolio", portfolioRoutes); // Подключение портфолио
app.use("/proposals", proposalRoutes); // Attach the proposals route
app.use("/api/stripe", stripeRoutes);
app.use("/projects", projects);
app.use("/improvements", improvements);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
