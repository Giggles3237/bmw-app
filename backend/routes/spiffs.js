const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * GET /api/spiffs/categories
 * Get all spiff categories
 */
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, description, is_active, created_at
      FROM spiff_categories
      WHERE is_active = 1
      ORDER BY name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching spiff categories:', err);
    res.status(500).json({ error: 'Failed to fetch spiff categories' });
  }
});

/**
 * GET /api/spiffs/types
 * Get all spiff types, optionally filtered by category
 */
router.get('/types', async (req, res) => {
  try {
    const { category_id } = req.query;
    let whereClause = 'WHERE st.is_active = 1';
    const params = [];
    
    if (category_id) {
      whereClause += ' AND st.category_id = ?';
      params.push(category_id);
    }
    
    const [rows] = await pool.query(`
      SELECT st.id, st.category_id, st.name, st.description, st.default_amount, 
             st.calculation_method, sc.name as category_name
      FROM spiff_types st
      LEFT JOIN spiff_categories sc ON st.category_id = sc.id
      ${whereClause}
      ORDER BY sc.name, st.name
    `, params);
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching spiff types:', err);
    res.status(500).json({ error: 'Failed to fetch spiff types' });
  }
});

/**
 * GET /api/spiffs/monthly
 * Get monthly spiffs for a specific month/year
 */
router.get('/monthly', async (req, res) => {
  try {
    const { month, year, salesperson_id, status } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }
    
    let whereClause = 'WHERE ms.month = ? AND ms.year = ?';
    const params = [month, year];
    
    if (salesperson_id) {
      whereClause += ' AND ms.salesperson_id = ?';
      params.push(salesperson_id);
    }
    
    if (status) {
      whereClause += ' AND ms.status = ?';
      params.push(status);
    }
    
    const [rows] = await pool.query(`
      SELECT ms.id, ms.month, ms.year, ms.salesperson_id, ms.spiff_type_id,
             ms.amount, ms.description, ms.status, ms.created_at, ms.approved_at,
             s.name as salesperson_name, st.name as spiff_type_name,
             sc.name as category_name, st.default_amount
      FROM monthly_spiffs ms
      LEFT JOIN salespersons s ON ms.salesperson_id = s.id
      LEFT JOIN spiff_types st ON ms.spiff_type_id = st.id
      LEFT JOIN spiff_categories sc ON st.category_id = sc.id
      ${whereClause}
      ORDER BY s.name, sc.name, st.name
    `, params);
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching monthly spiffs:', err);
    res.status(500).json({ error: 'Failed to fetch monthly spiffs' });
  }
});

/**
 * POST /api/spiffs/monthly
 * Create a new monthly spiff
 */
router.post('/monthly', async (req, res) => {
  try {
    const { month, year, salesperson_id, spiff_type_id, spiff_type_name, amount, description, notes } = req.body;
    
    // Validate required fields
    if (!month || !year || !salesperson_id || !amount) {
      return res.status(400).json({ 
        error: 'Month, year, salesperson_id, and amount are required' 
      });
    }
    
    // Validate that either spiff_type_id or spiff_type_name is provided
    if (!spiff_type_id && !spiff_type_name) {
      return res.status(400).json({ 
        error: 'Either spiff_type_id or spiff_type_name is required' 
      });
    }
    
    // If spiff_type_name is provided, create or find the spiff type
    let finalSpiffTypeId = spiff_type_id;
    
    if (spiff_type_name && !spiff_type_id) {
      // Check if spiff type already exists
      const [existingType] = await pool.query(`
        SELECT id FROM spiff_types WHERE name = ?
      `, [spiff_type_name]);
      
      if (existingType.length > 0) {
        finalSpiffTypeId = existingType[0].id;
      } else {
        // Create new spiff type in "Special Recognition" category (category_id 5)
        const [newType] = await pool.query(`
          INSERT INTO spiff_types (category_id, name, description, default_amount, calculation_method)
          VALUES (5, ?, ?, ?, 'fixed')
        `, [spiff_type_name, description || '', amount]);
        
        finalSpiffTypeId = newType.insertId;
      }
    }
    
    if (!finalSpiffTypeId) {
      return res.status(400).json({ 
        error: 'Either spiff_type_id or spiff_type_name is required' 
      });
    }
    
    // Check if spiff already exists for this combination
    const [existing] = await pool.query(`
      SELECT id FROM monthly_spiffs 
      WHERE month = ? AND year = ? AND salesperson_id = ? AND spiff_type_id = ?
    `, [month, year, salesperson_id, finalSpiffTypeId]);
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'A spiff of this type already exists for this salesperson this month' 
      });
    }
    
    // Create the spiff
    const [result] = await pool.query(`
      INSERT INTO monthly_spiffs 
      (month, year, salesperson_id, spiff_type_id, amount, description, notes, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', 1)
    `, [month, year, salesperson_id, finalSpiffTypeId, amount, description || null, notes || null]);
    
    // Return the created spiff with full details
    const [newSpiff] = await pool.query(`
      SELECT ms.id, ms.month, ms.year, ms.salesperson_id, ms.spiff_type_id,
             ms.amount, ms.description, ms.status, ms.created_at,
             s.name as salesperson_name, st.name as spiff_type_name,
             sc.name as category_name
      FROM monthly_spiffs ms
      LEFT JOIN salespersons s ON ms.salesperson_id = s.id
      LEFT JOIN spiff_types st ON ms.spiff_type_id = st.id
      LEFT JOIN spiff_categories sc ON st.category_id = sc.id
      WHERE ms.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newSpiff[0]);
  } catch (err) {
    console.error('Error creating monthly spiff:', err);
    res.status(500).json({ error: 'Failed to create monthly spiff' });
  }
});

/**
 * PUT /api/spiffs/monthly/:id
 * Update an existing monthly spiff
 */
router.put('/monthly/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, status, notes, spiff_type_name } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const params = [];
    
    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'approved') {
        updates.push('approved_at = NOW()');
      } else if (status === 'paid') {
        updates.push('paid_at = NOW()');
      }
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    
    // Handle spiff type name update
    if (spiff_type_name !== undefined) {
      // Check if spiff type already exists
      const [existingType] = await pool.query(`
        SELECT id FROM spiff_types WHERE name = ?
      `, [spiff_type_name]);
      
      let spiffTypeId;
      if (existingType.length > 0) {
        spiffTypeId = existingType[0].id;
      } else {
        // Create new spiff type in "Special Recognition" category (category_id 5)
        const [newType] = await pool.query(`
          INSERT INTO spiff_types (category_id, name, description, default_amount, calculation_method)
          VALUES (5, ?, ?, ?, 'fixed')
        `, [spiff_type_name, description || '', amount || 0]);
        
        spiffTypeId = newType.insertId;
      }
      
      updates.push('spiff_type_id = ?');
      params.push(spiffTypeId);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    params.push(id);
    
    await pool.query(`
      UPDATE monthly_spiffs 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    // Return updated spiff
    const [updatedSpiff] = await pool.query(`
      SELECT ms.id, ms.month, ms.year, ms.salesperson_id, ms.spiff_type_id,
             ms.amount, ms.description, ms.status, ms.created_at, ms.approved_at, ms.paid_at,
             s.name as salesperson_name, st.name as spiff_type_name,
             sc.name as category_name
      FROM monthly_spiffs ms
      LEFT JOIN salespersons s ON ms.salesperson_id = s.id
      LEFT JOIN spiff_types st ON ms.spiff_type_id = st.id
      LEFT JOIN spiff_categories sc ON st.category_id = sc.id
      WHERE ms.id = ?
    `, [id]);
    
    res.json(updatedSpiff[0]);
  } catch (err) {
    console.error('Error updating monthly spiff:', err);
    res.status(500).json({ error: 'Failed to update monthly spiff' });
  }
});

/**
 * DELETE /api/spiffs/monthly/:id
 * Delete a monthly spiff
 */
router.delete('/monthly/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM monthly_spiffs WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Spiff not found' });
    }
    
    res.json({ message: 'Spiff deleted successfully' });
  } catch (err) {
    console.error('Error deleting monthly spiff:', err);
    res.status(500).json({ error: 'Failed to delete monthly spiff' });
  }
});

/**
 * GET /api/spiffs/summary/:month/:year
 * Get spiff summary for a specific month
 */
router.get('/summary/:month/:year', async (req, res) => {
  try {
    const { month, year } = req.params;
    
    const [rows] = await pool.query(`
      SELECT 
        s.id as salesperson_id,
        s.name as salesperson_name,
        COUNT(ms.id) as total_spiffs,
        SUM(CASE WHEN ms.status = 'approved' THEN ms.amount ELSE 0 END) as approved_amount,
        SUM(CASE WHEN ms.status = 'paid' THEN ms.amount ELSE 0 END) as paid_amount,
        SUM(ms.amount) as total_amount
      FROM salespersons s
      LEFT JOIN monthly_spiffs ms ON s.id = ms.salesperson_id AND ms.month = ? AND ms.year = ?
      GROUP BY s.id, s.name
      HAVING total_spiffs > 0
      ORDER BY s.name
    `, [month, year]);
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching spiff summary:', err);
    res.status(500).json({ error: 'Failed to fetch spiff summary' });
  }
});

module.exports = router;
