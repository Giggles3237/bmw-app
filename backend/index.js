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

// Mount our routers.  All API routes are prefixed with /api to
// clearly separate them from any static assets you might serve.
app.use('/api/auth', authRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/salespersons', salespersonsRouter);
app.use('/api/reports', reportsRouter);

// Start listening for incoming requests.  The port can be
// configured via the PORT environment variable.
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});