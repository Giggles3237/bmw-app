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
    const [rows] = await pool.query('SELECT id, name FROM salespersons ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/salespersons
 *
 * Creates a new salesperson.  Expects a JSON body with a `name` field.
 */
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    // Check if salesperson already exists
    const [existing] = await pool.query('SELECT id FROM salespersons WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Salesperson already exists' });
    }
    const [result] = await pool.query('INSERT INTO salespersons (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
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
    const [rows] = await pool.query('SELECT id, name FROM salespersons WHERE id = ?', [id]);
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
 * Updates a salesperson's name.
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    await pool.query('UPDATE salespersons SET name = ? WHERE id = ?', [name, id]);
    res.json({ message: 'Salesperson updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/salespersons/:id
 *
 * Deletes a salesperson.  Note: if a salesperson is referenced by a
 * deal the deletion will fail due to foreign key constraint.  You
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