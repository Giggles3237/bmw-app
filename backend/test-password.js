const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'admin123';
  const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Password test result:', isValid);
  
  // Also test with 'password'
  const isValid2 = await bcrypt.compare('password', hash);
  console.log('Password "password" test result:', isValid2);
  
  // Generate a new hash for 'admin123'
  const newHash = await bcrypt.hash('admin123', 10);
  console.log('New hash for admin123:', newHash);
}

testPassword();
