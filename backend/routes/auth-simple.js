const express = require('express');
const db = require('../db');

const router = express.Router();

// Simple in-memory user store for now
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    email: 'admin@bmw.com'
  },
  {
    id: 2,
    username: 'manager',
    password: 'manager123',
    first_name: 'Manager',
    last_name: 'User',
    role: 'manager',
    email: 'manager@bmw.com'
  },
  {
    id: 3,
    username: 'sales',
    password: 'sales123',
    first_name: 'Sales',
    last_name: 'User',
    role: 'salesperson',
    email: 'sales@bmw.com'
  }
];

// Simple login without JWT for now
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, password });

    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      console.log('Login failed: Invalid credentials');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful:', user.username);

    // Create a simple session token (just the user ID for now)
    const token = `user_${user.id}_${Date.now()}`;

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        salesperson_id: null,
        salesperson_name: null
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple token verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Extract user ID from token
  const userId = parseInt(token.split('_')[1]);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
};

// Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userList = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: true,
      salesperson_id: null,
      salesperson_name: null
    }));

    res.json({ users: userList });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register new user (admin only)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, email, first_name, last_name, role, is_active, is_salesperson, password } = req.body;

    // Check if username already exists
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create new user
    const newId = users.length + 1;
    const newUser = {
      id: newId,
      username,
      email,
      first_name,
      last_name,
      role,
      is_active,
      password: password || 'temp123',
      salesperson_id: is_salesperson ? newId : null
    };

    users.push(newUser);

    console.log('New user created:', username);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        is_active: newUser.is_active,
        salesperson_id: newUser.salesperson_id,
        salesperson_name: null
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = parseInt(req.params.id);
    const { email, first_name, last_name, role, is_active, is_salesperson } = req.body;

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      email,
      first_name,
      last_name,
      role,
      is_active,
      salesperson_id: is_salesperson ? users[userIndex].id : null
    };

    console.log('User updated:', users[userIndex].username);

    res.json({
      message: 'User updated successfully',
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        email: users[userIndex].email,
        first_name: users[userIndex].first_name,
        last_name: users[userIndex].last_name,
        role: users[userIndex].role,
        is_active: users[userIndex].is_active,
        salesperson_id: users[userIndex].salesperson_id,
        salesperson_name: null
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
