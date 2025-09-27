const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file.  If no .env file is
// present the defaults in db.js will be used.
dotenv.config();

// Import routers.  Each router encapsulates a section of the API.
const authRouter = require('./routes/auth-simple');
const dealsRouter = require('./routes/deals');
const salespersonsRouter = require('./routes/salespersons');
const reportsRouter = require('./routes/reports');
const spiffsRouter = require('./routes/spiffs');

const app = express();

// Enable CORS so that requests from the React frontend running on a
// different port or domain are accepted.  In production you should
// restrict the allowed origins to your own domain.
app.use(cors());

// Automatically parse incoming JSON bodies.
app.use(express.json());

// A simple root route.  This can be used as a health check.
app.get('/', (req, res) => {
  res.send('BMW Sales Management API');
});

// Health check route to test database connection
app.get('/health', async (req, res) => {
  try {
    const db = require('./db');
    await db.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// Mount our routers.  In most environments the frontend talks to the
// backend using a `/api` prefix (e.g. `/api/reports`).  However when
// the application is deployed to Vercel the platform rewrites the
// incoming `/api/*` requests before invoking the serverless function.
// Inside the function the request path no longer includes the `/api`
// prefix which caused 404s because our routers were only mounted at
// `/api/...`.  To support both local development and the serverless
// deployment we mount the routers at both the `/api` prefixed paths
// and their root-level equivalents.
const mountRoutes = (prefix = '') => {
  const base = prefix ? `${prefix}` : '';
  app.use(`${base}/auth`, authRouter);
  app.use(`${base}/deals`, dealsRouter);
  app.use(`${base}/salespersons`, salespersonsRouter);
  app.use(`${base}/reports`, reportsRouter);
  app.use(`${base}/spiffs`, spiffsRouter);
};

mountRoutes('/api');
mountRoutes('');

// Start listening for incoming requests.  The port can be
// configured via the PORT environment variable.
const port = process.env.PORT || 3001;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

// Export the app for Vercel serverless functions
module.exports = app;