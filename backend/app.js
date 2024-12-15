const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Authentication routes
const orderRoutes = require('./routes/orders'); // Order routes
const portfolioRoutes = require("./routes/portfolio"); 

const app = express();
const cors = require('cors');
app.use(cors({ origin: "*" }));

app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes); // Auth routes
app.use('/orders', orderRoutes); // Order routes
app.use("/portfolio", portfolioRoutes); // Подключение портфолио

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
