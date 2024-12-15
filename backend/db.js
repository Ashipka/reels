const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'reels_marketplace',
    password: 'Veroni4ka', // Replace with your PostgreSQL password
    port: 5432,
  });

module.exports = pool;