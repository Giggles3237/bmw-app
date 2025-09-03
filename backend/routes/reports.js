const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * GET /api/reports/salesperson
 *
 * Returns aggregated financial data per salesperson for a given
 * month and year.  If month or year are omitted the totals
 * represent all available data.
 *
 * Example response:
 * [
 *   {
 *     "salesperson": "Bill Romango",
 *     "deal_count": 3,
 *     "fe_gross_total": 12345.67,
 *     "avp_total": 2345.00,
 *     "be_gross_total": 567.89,
 *     ...
 *   },
 *   ...
 * ]
 */
router.get('/salesperson', async (req, res) => {
  try {
    const { month, year, salesperson_id } = req.query;
    const params = [];
    let where = '';
    // Build dynamic WHERE clause based on optional filters
    if (month) {
      where += where ? ' AND d.month = ?' : ' WHERE d.month = ?';
      params.push(month);
    }
    if (year) {
      where += where ? ' AND d.year = ?' : ' WHERE d.year = ?';
      params.push(year);
    }
    if (salesperson_id) {
      where += where ? ' AND d.salesperson_id = ?' : ' WHERE d.salesperson_id = ?';
      params.push(salesperson_id);
    }
    const sql = `
      SELECT s.name AS salesperson,
             COUNT(*) AS deal_count,
             SUM(COALESCE(d.fe_gross, 0)) AS fe_gross_total,
             SUM(COALESCE(d.avp, 0)) AS avp_total,
             SUM(COALESCE(d.be_gross, 0)) AS be_gross_total,
             SUM(COALESCE(d.reserve, 0)) AS reserve_total,
             SUM(COALESCE(d.rewards, 0)) AS rewards_total,
             SUM(COALESCE(d.vsc, 0)) AS vsc_total,
             SUM(COALESCE(d.maintenance, 0)) AS maintenance_total,
             SUM(COALESCE(d.gap, 0)) AS gap_total,
             SUM(COALESCE(d.cilajet, 0)) AS cilajet_total,
             SUM(COALESCE(d.diamon, 0)) AS diamon_total,
             SUM(COALESCE(d.key_product, 0)) AS key_total,
             SUM(COALESCE(d.collision_product, 0)) AS collision_total,
             SUM(COALESCE(d.dent_product, 0)) AS dent_total,
             SUM(COALESCE(d.excess, 0)) AS excess_total,
             SUM(COALESCE(d.ppf, 0)) AS ppf_total,
             SUM(COALESCE(d.wheel_and_tire, 0)) AS wheel_and_tire_total,
             SUM(COALESCE(d.product_count, 0)) AS product_count_total,
             SUM(COALESCE(d.money, 0)) AS money_total,
             SUM(COALESCE(d.titling, 0)) AS titling_total,
             SUM(COALESCE(d.mileage, 0)) AS mileage_total,
             SUM(COALESCE(d.license_insurance, 0)) AS license_insurance_total,
             SUM(COALESCE(d.fees, 0)) AS fees_total
      FROM deals d
      LEFT JOIN salespersons s ON d.salesperson_id = s.id
      ${where}
      GROUP BY s.name
      ORDER BY s.name`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/reports/unit
 *
 * Returns a summary of deals grouped by vehicle type for a given
 * month and year.  The vehicle type corresponds to the `type` field
 * on the deals table (e.g. New BMW, CPO BMW, New MINI, Used BMW).
 */
router.get('/unit', async (req, res) => {
  try {
    const { month, year, start_date, end_date } = req.query;
    const params = [];
    let where = '';
    
    if (start_date && end_date) {
      // Custom date range
      where += ' WHERE d.date >= ? AND d.date <= ?';
      params.push(start_date, end_date);
    } else {
      // Month/year filtering
      if (month) {
        where += where ? ' AND d.month = ?' : ' WHERE d.month = ?';
        params.push(month);
      }
      if (year) {
        where += where ? ' AND d.year = ?' : ' WHERE d.year = ?';
        params.push(year);
      }
    }
    
    const sql = `
      SELECT d.type,
             COUNT(*) AS units,
             SUM(COALESCE(d.fe_gross, 0)) AS fe_gross_total,
             SUM(COALESCE(d.avp, 0)) AS avp_total,
             SUM(COALESCE(d.be_gross, 0)) AS be_gross_total
      FROM deals d
      ${where}
      GROUP BY d.type
      ORDER BY units DESC`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/reports/data-master
 *
 * A convenience endpoint that returns all deals for the given
 * month/year.  This is equivalent to GET /api/deals but provided
 * here for symmetry with the Excel sheet names.
 */
router.get('/data-master', async (req, res) => {
  try {
    const { month, year } = req.query;
    const params = [];
    let where = '';
    if (month) {
      where += where ? ' AND month = ?' : ' WHERE month = ?';
      params.push(month);
    }
    if (year) {
      where += where ? ' AND year = ?' : ' WHERE year = ?';
      params.push(year);
    }
    const [rows] = await pool.query(`SELECT * FROM deals${where}`, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;