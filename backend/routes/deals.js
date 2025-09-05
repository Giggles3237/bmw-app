const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * Utility function to find or create a salesperson by name.
 * Returns the id of the salesperson.  If name is falsy
 * (null/undefined/empty string) then null is returned.
 */
async function getSalespersonId(name) {
  if (!name) return null;
  // Try to find existing salesperson
  const [rows] = await pool.query('SELECT id FROM salespersons WHERE name = ?', [name]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  // Create a new salesperson
  const [result] = await pool.query('INSERT INTO salespersons (name) VALUES (?)', [name]);
  return result.insertId;
}

/**
 * Utility function to find or create a finance manager by name.
 * Returns the id of the finance manager.  If name is falsy
 * then null is returned.
 */
async function getFinanceManagerId(name) {
  if (!name) return null;
  const [rows] = await pool.query('SELECT id FROM finance_managers WHERE name = ?', [name]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  const [result] = await pool.query('INSERT INTO finance_managers (name) VALUES (?)', [name]);
  return result.insertId;
}

/**
 * GET /api/deals
 *
 * Returns a list of deals.  Optional query parameters:
 *   - month: filter by the numeric month (1-12)
 *   - year: filter by year (e.g. 2025)
 *   - limit: maximum number of records to return
 */
router.get('/', async (req, res) => {
  try {
    const { month, year, limit, type, start_date, end_date } = req.query;
    let sql =
      'SELECT d.*, s.name AS salesperson_name, f.name AS finance_manager_name\n' +
      'FROM deals d\n' +
      'LEFT JOIN salespersons s ON d.salesperson_id = s.id\n' +
      'LEFT JOIN finance_managers f ON d.finance_manager_id = f.id';
    const params = [];
    const conditions = [];
    
    if (start_date && end_date) {
      // Custom date range
      conditions.push('d.date >= ? AND d.date <= ?');
      params.push(start_date, end_date);
    } else {
      // Month/year filtering
      if (month) {
        conditions.push('d.month = ?');
        params.push(month);
      }
      if (year) {
        conditions.push('d.year = ?');
        params.push(year);
      }
    }
    
    if (type) {
      conditions.push('d.type = ?');
      params.push(type);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY d.date DESC';
    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }
    const [rows] = await pool.query(sql, params);
    console.log('Raw database rows:', rows.slice(0, 2)); // Log first 2 rows for debugging
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/deals/:id
 *
 * Returns a single deal by id.
 */
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      'SELECT d.*, s.name AS salesperson_name, f.name AS finance_manager_name\n' +
        'FROM deals d\n' +
        'LEFT JOIN salespersons s ON d.salesperson_id = s.id\n' +
        'LEFT JOIN finance_managers f ON d.finance_manager_id = f.id\n' +
        'WHERE d.id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/deals
 *
 * Creates a new deal.  The request body should contain a JSON object
 * with the deal fields.  Only the fields you provide will be saved;
 * missing fields will remain NULL in the database.  The salesperson
 * and finance manager names will be normalised into their respective
 * tables automatically.
 */
router.post('/', async (req, res) => {
  try {
    const data = req.body || {};
    // Normalise salesperson and finance manager names into ids.
    const salespersonId = await getSalespersonId(data.salesperson);
    const financeManagerId = await getFinanceManagerId(data.finance_manager);

    // Build an object representing the columns in the deals table.
    // Only include keys that are present in the request body.
    const fields = {
      external_id: data.external_id,
      date: data.date,
      month: data.month,
      year: data.year,
      bank: data.bank,
      funded_date: data.funded_date,
      stock_number: data.stock_number,
      name: data.name,
      salesperson_id: salespersonId,
      split: data.split,
      type: data.type,
      used_car_source: data.used_car_source,
      age: data.age,
      fe_gross: data.fe_gross,
      avp: data.avp,
      be_gross: data.be_gross,
      finance_manager_id: financeManagerId,
      reserve: data.reserve,
      rewards: data.rewards,
      vsc: data.vsc,
      maintenance: data.maintenance,
      gap: data.gap,
      cilajet: data.cilajet,
      diamon: data.diamon,
      key_product: data.key_product,
      collision_product: data.collision_product,
      dent_product: data.dent_product,
      excess: data.excess,
      ppf: data.ppf,
      wheel_and_tire: data.wheel_and_tire,
      product_count: data.product_count,
      money: data.money,
      titling: data.titling,
      mileage: data.mileage,
      license_insurance: data.license_insurance,
      fees: data.fees,
      notes: data.notes,
      split2: data.split2,
      funded: data.funded,
      funded_timestamp: data.funded_timestamp,
      registration_complete_date: data.registration_complete_date
    };
    // Extract only defined columns.  Undefined values are ignored so
    // that they remain NULL in the database.
    const columns = Object.keys(fields).filter((key) => fields[key] !== undefined);
    const values = columns.map((key) => fields[key]);
    if (columns.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO deals (${columns.join(', ')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/deals/:id
 *
 * Updates an existing deal.  Only the fields present in the
 * request body will be updated.  Salesperson and finance manager
 * names are normalised similar to POST.
 */
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body || {};
    const updates = {};
    if (data.salesperson !== undefined) {
      updates.salesperson_id = await getSalespersonId(data.salesperson);
    }
    if (data.finance_manager !== undefined) {
      updates.finance_manager_id = await getFinanceManagerId(data.finance_manager);
    }
    // Copy all other fields directly
    const allowedFields = [
      'external_id',
      'date',
      'month',
      'year',
      'bank',
      'funded_date',
      'stock_number',
      'name',
      'split',
      'type',
      'used_car_source',
      'age',
      'fe_gross',
      'avp',
      'be_gross',
      'reserve',
      'rewards',
      'vsc',
      'maintenance',
      'gap',
      'cilajet',
      'diamon',
      'key_product',
      'collision_product',
      'dent_product',
      'excess',
      'ppf',
      'wheel_and_tire',
      'product_count',
      'money',
      'titling',
      'mileage',
      'license_insurance',
      'fees',
      'notes',
      'split2',
      'funded',
      'funded_timestamp',
      'registration_complete_date'
    ];
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const setClauses = [];
    const values = [];
    for (const [column, value] of Object.entries(updates)) {
      setClauses.push(`${column} = ?`);
      values.push(value);
    }
    values.push(id);
    const sql = `UPDATE deals SET ${setClauses.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);
    res.json({ message: 'Deal updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/deals/:id
 *
 * Deletes a deal by id.
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM deals WHERE id = ?', [id]);
    res.json({ message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;