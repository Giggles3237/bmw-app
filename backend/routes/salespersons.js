const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * GET /api/salespersons
 *
 * Returns a list of all salespeople sorted alphabetically.
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, employee_number, email, phone, is_active, role, payplan, demo_eligible, created_at, updated_at 
      FROM salespersons 
      ORDER BY name ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/salespersons
 *
 * Creates a new salesperson. Expects a JSON body with required fields.
 */
router.post('/', async (req, res) => {
  try {
    const { name, employee_number, email, phone, role = 'salesperson', payplan = 'BMW', demo_eligible = true } = req.body;
    
    if (!name || !employee_number) {
      return res.status(400).json({ error: 'Name and Employee Number are required' });
    }

    // Check if salesperson already exists by name
    const [existingName] = await pool.query(
      'SELECT id FROM salespersons WHERE name = ?', 
      [name]
    );
    
    if (existingName.length > 0) {
      return res.status(400).json({ error: 'Salesperson with this name already exists' });
    }

    // Check if employee number already exists
    const [existingEmployeeNumber] = await pool.query(
      'SELECT id FROM salespersons WHERE employee_number = ?', 
      [employee_number]
    );
    
    if (existingEmployeeNumber.length > 0) {
      return res.status(400).json({ error: 'Employee number already exists' });
    }

    // Check if email already exists (only if email is provided and not empty)
    if (email && email.trim() !== '') {
      const [existingEmail] = await pool.query(
        'SELECT id FROM salespersons WHERE email = ?', 
        [email]
      );
      
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Convert empty email to null to avoid UNIQUE constraint issues
    const emailValue = (email && email.trim() !== '') ? email : null;
    
    const [result] = await pool.query(
      'INSERT INTO salespersons (name, employee_number, email, phone, role, payplan, demo_eligible, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, employee_number, emailValue, phone, role, payplan, demo_eligible, false]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      employee_number, 
      email, 
      phone, 
      role 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/salespersons/:id
 *
 * Returns a single salesperson by id.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT id, name, employee_number, email, phone, is_active, role, payplan, demo_eligible, created_at, updated_at 
      FROM salespersons 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Salesperson not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/salespersons/:id
 *
 * Updates a salesperson's information.
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, employee_number, email, phone, is_active, role, payplan, demo_eligible } = req.body;
    
    console.log('PUT /salespersons/:id - Request received');
    console.log('ID:', id);
    console.log('Request body:', req.body);
    console.log('Extracted fields:', { name, employee_number, email, phone, is_active, role, payplan, demo_eligible });
    
    if (!name || !employee_number) {
      return res.status(400).json({ error: 'Name and Employee Number are required' });
    }

    // Check if another salesperson has the same employee number
    const [existingEmployeeNumber] = await pool.query(
      'SELECT id FROM salespersons WHERE employee_number = ? AND id != ?', 
      [employee_number, id]
    );
    
    if (existingEmployeeNumber.length > 0) {
      return res.status(400).json({ error: 'Employee number already exists for another salesperson' });
    }

    // Check if another salesperson has the same email (only if email is provided and not empty)
    if (email && email.trim() !== '') {
      const [existingEmail] = await pool.query(
        'SELECT id FROM salespersons WHERE email = ? AND id != ?', 
        [email, id]
      );
      
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already exists for another salesperson' });
      }
    }

    // Convert empty email to null to avoid UNIQUE constraint issues
    const emailValue = (email && email.trim() !== '') ? email : null;
    
    console.log('About to execute UPDATE query with params:', [name, employee_number, emailValue, phone, is_active, role, payplan, demo_eligible, id]);
    
    const result = await pool.query(
      'UPDATE salespersons SET name = ?, employee_number = ?, email = ?, phone = ?, is_active = ?, role = ?, payplan = ?, demo_eligible = ? WHERE id = ?',
      [name, employee_number, emailValue, phone, is_active, role, payplan, demo_eligible, id]
    );
    
    console.log('UPDATE query result:', result);
    console.log('Rows affected:', result[0].affectedRows);
    
    res.json({ message: 'Salesperson updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/salespersons/:id
 *
 * Deletes a salesperson. Note: if a salesperson is referenced by a
 * deal the deletion will fail due to foreign key constraint. You
 * should reassign or remove deals before deleting a salesperson.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM salespersons WHERE id = ?', [id]);
    res.json({ message: 'Salesperson deleted' });
  } catch (err) {
    // MySQL error code 1451 indicates a foreign key constraint failure.
    if (err.errno === 1451) {
      return res.status(409).json({ error: 'Cannot delete salesperson because they are referenced by deals' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;