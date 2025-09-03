const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
// Load environment variables from .env file.  In production
// (e.g. on Azure) you can set these variables via the configuration
// options of your hosting service.
dotenv.config();

// Create a connection pool.  The pool will manage multiple
// simultaneous connections and automatically recycle idle ones.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'bmw',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;