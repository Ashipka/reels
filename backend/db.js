require('dotenv').config();

const { Pool } = require('pg');
const isProduction = process.env.NODE_ENV === "production";
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false } // For production
    : false, // For local development
};

const pool = new Pool(connectionConfig);

module.exports = pool;