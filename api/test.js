const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Simple login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password });
  
  // Simple hardcoded login for testing
  if (username === 'admin' && password === 'admin123') {
    res.json({
      token: 'test-token-123',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@bmw.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = app;
