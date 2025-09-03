const bcrypt = require('bcryptjs');
const db = require('./db');

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash('admin123', saltRounds);

    // Insert admin user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin', 'admin@bmw.com', password_hash, 'Admin', 'User', 'admin']
    );

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
