const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the auth router
const authRouter = require('../../backend/routes/auth-simple');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Mount the auth router
app.use('/', authRouter);

module.exports = app;
