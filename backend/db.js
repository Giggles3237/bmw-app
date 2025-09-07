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
  },
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test the connection on startup
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    console.error('Connection config:', {
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      database: process.env.MYSQL_DATABASE || 'bmw',
      ssl: process.env.MYSQL_SSL || 'false'
    });
  });

module.exports = pool;