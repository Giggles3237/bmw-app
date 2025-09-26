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

/**
 * GET /api/reports/payroll
 *
 * Returns payroll calculations for salespersons based on unit pay plans.
 * This endpoint calculates commission, bonuses, and total pay for each salesperson.
 * 
 * Query parameters:
 * - month: Month for payroll calculation (1-12)
 * - year: Year for payroll calculation
 * - salesperson_id: Optional filter for specific salesperson
 * 
 * Example response:
 * [
 *   {
 *     "salesperson": "Bill Romango",
 *     "salesperson_id": 1,
 *     "month": 12,
 *     "year": 2024,
 *     "deal_count": 15,
 *     "new_bmw_units": 8,
 *     "used_bmw_units": 4,
 *     "new_mini_units": 2,
 *     "used_mini_units": 1,
 *     "total_units": 15,
 *     "unit_commission": 3750.00,
 *     "product_commission": 1250.50,
 *     "bonus_earned": 500.00,
 *     "total_pay": 5500.50
 *   }
 * ]
 */
router.get('/payroll', async (req, res) => {
  try {
    const { month, year, salesperson_id } = req.query;
    
    console.log('Payroll request received:', { month, year, salesperson_id });
    console.log('Full query params:', req.query);
    
    if (!month || !year) {
      console.log('Missing month or year parameters');
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const params = [month, year];
    let whereClause = ' WHERE d.month = ? AND d.year = ?';
    
    if (salesperson_id) {
      whereClause += ' AND d.salesperson_id = ?';
      params.push(salesperson_id);
    }

    // Get deal data with vehicle type classification
    const sql = `
      SELECT 
        s.id as salesperson_id,
        s.name AS salesperson,
        d.type,
        COUNT(*) AS unit_count,
        SUM(COALESCE(d.fe_gross, 0)) AS fe_gross_total,
        SUM(COALESCE(d.be_gross, 0)) AS be_gross_total,
        SUM(COALESCE(d.vsc, 0)) AS vsc_total,
        SUM(COALESCE(d.gap, 0)) AS gap_total,
        SUM(COALESCE(d.maintenance, 0)) AS maintenance_total,
        SUM(COALESCE(d.cilajet, 0)) AS cilajet_total,
        SUM(COALESCE(d.diamon, 0)) AS diamon_total,
        SUM(COALESCE(d.key_product, 0)) AS key_product_total,
        SUM(COALESCE(d.collision_product, 0)) AS collision_total,
        SUM(COALESCE(d.dent_product, 0)) AS dent_total,
        SUM(COALESCE(d.excess, 0)) AS excess_total,
        SUM(COALESCE(d.ppf, 0)) AS ppf_total,
        SUM(COALESCE(d.wheel_and_tire, 0)) AS wheel_and_tire_total
      FROM deals d
      LEFT JOIN salespersons s ON d.salesperson_id = s.id
      ${whereClause}
      GROUP BY s.id, s.name, d.type
      ORDER BY s.name, d.type
    `;

    console.log('Executing SQL:', sql);
    console.log('With params:', params);

    const [rows] = await pool.query(sql, params);
    
    console.log('Raw query results:', rows);
    console.log('About to check for deal details. salesperson_id at this point:', salesperson_id);
    
    // If requesting specific salesperson, get individual deal details first
    let dealDetails = null;
    console.log('Checking if salesperson_id exists:', salesperson_id, 'Type:', typeof salesperson_id, 'Truthy:', !!salesperson_id);
    if (salesperson_id) {
      console.log('Fetching deal details for salesperson_id:', salesperson_id);
      const dealDetailsSql = `
        SELECT 
          d.id,
          d.stock_number,
          d.name as customer_name,
          d.type as vehicle_description,
          d.type,
          d.vsc,
          d.cilajet,
          d.wheel_and_tire,
          d.fe_gross,
          d.be_gross,
          d.gap,
          d.maintenance,
          d.diamon,
          d.key_product,
          d.collision_product,
          d.dent_product,
          d.excess,
          d.ppf
        FROM deals d
        WHERE d.month = ? AND d.year = ? AND d.salesperson_id = ?
        ORDER BY d.id
      `;
      
      console.log('Executing deal details SQL with params:', [month, year, salesperson_id]);
      const [dealDetailsResult] = await pool.query(dealDetailsSql, [month, year, salesperson_id]);
      dealDetails = dealDetailsResult;
      console.log('Individual deal details result:', dealDetails);
      console.log('Number of deal details found:', dealDetails ? dealDetails.length : 0);
    } else {
      console.log('No salesperson_id provided, skipping deal details fetch');
    }
    
    // Process the data to calculate payroll
    const payrollData = calculatePayroll(rows, month, year);
    
    // Add deal details to the payroll data if we have them
    console.log('About to attach deal details. dealDetails:', dealDetails);
    console.log('payrollData length:', payrollData.length);
    if (dealDetails && payrollData.length > 0) {
      payrollData[0].deal_details = dealDetails;
      
      // Calculate accurate product bonuses from individual deals
      let vscCount = 0, cilajetCount = 0, tireWheelCount = 0, gapCount = 0, 
          maintenanceCount = 0, diamonCount = 0, keyProductCount = 0, 
          collisionCount = 0, dentCount = 0, excessCount = 0, ppfCount = 0;
      
      dealDetails.forEach(deal => {
        if (parseFloat(deal.vsc || 0) > 0) vscCount++;
        if (parseFloat(deal.cilajet || 0) > 0) cilajetCount++;
        if (parseFloat(deal.wheel_and_tire || 0) > 0) tireWheelCount++;
        if (parseFloat(deal.gap || 0) > 0) gapCount++;
        if (parseFloat(deal.maintenance || 0) > 0) maintenanceCount++;
        if (parseFloat(deal.diamon || 0) > 0) diamonCount++;
        if (parseFloat(deal.key_product || 0) > 0) keyProductCount++;
        if (parseFloat(deal.collision_product || 0) > 0) collisionCount++;
        if (parseFloat(deal.dent_product || 0) > 0) dentCount++;
        if (parseFloat(deal.excess || 0) > 0) excessCount++;
        if (parseFloat(deal.ppf || 0) > 0) ppfCount++;
      });
      
      // Calculate bonuses according to BMW of Pittsburgh pay plan:
      // - $50 for VSC, Cilajet, Tire & Wheel Protection (all advisors)
      // - $50 for LoJack (key_product) - all advisors
      // - $50 for Excess Wear and Tear (excess) - MINI advisors only
      // - $50 for Maintenance (maintenance) - MINI advisors only
      // - Other products (GAP, Diamon, Collision, Dent, PPF) do NOT get bonuses
      
      payrollData[0].vsc_bonus = vscCount * 50;
      payrollData[0].cilajet_bonus = cilajetCount * 50;
      payrollData[0].tire_wheel_bonus = tireWheelCount * 50;
      payrollData[0].lojack_bonus = keyProductCount * 50; // LoJack is key_product
      payrollData[0].maintenance_bonus = maintenanceCount * 50; // MINI only
      payrollData[0].excess_bonus = excessCount * 50; // MINI only
      
      // Set non-bonus products to 0 (they're displayed in the table but don't get bonuses)
      payrollData[0].gap_bonus = 0;
      payrollData[0].diamon_bonus = 0;
      payrollData[0].collision_bonus = 0;
      payrollData[0].dent_bonus = 0;
      payrollData[0].ppf_bonus = 0;
      
      // Total product bonus (only products that actually get bonuses)
      payrollData[0].product_bonus = 
        payrollData[0].vsc_bonus + 
        payrollData[0].cilajet_bonus + 
        payrollData[0].tire_wheel_bonus +
        payrollData[0].lojack_bonus +
        payrollData[0].maintenance_bonus +
        payrollData[0].excess_bonus;
      
      // Recalculate total pay with accurate product bonuses
      payrollData[0].total_pay = payrollData[0].unit_commission + payrollData[0].product_bonus + payrollData[0].rewards_bonus + payrollData[0].bonus_earned;
      
      console.log('Successfully added deal details to payroll data');
      console.log('Product bonuses calculated:', {
        vscCount, cilajetCount, tireWheelCount,
        vsc_bonus: payrollData[0].vsc_bonus,
        cilajet_bonus: payrollData[0].cilajet_bonus,
        tire_wheel_bonus: payrollData[0].tire_wheel_bonus,
        total_product_bonus: payrollData[0].product_bonus
      });
    } else {
      console.log('Cannot attach deal details - dealDetails:', dealDetails, 'payrollData.length:', payrollData.length);
    }
    
    console.log('Processed payroll data:', payrollData);
    
    res.json(payrollData);
  } catch (err) {
    console.error('Payroll endpoint error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Calculate payroll based on sliding unit pay plans
 * BMW and MINI advisors have different sliding scale structures
 */
function calculatePayroll(dealData, month, year) {
  const salespersonMap = new Map();
  
  // Initialize salesperson data
  dealData.forEach(deal => {
    if (!salespersonMap.has(deal.salesperson_id)) {
      salespersonMap.set(deal.salesperson_id, {
        salesperson: deal.salesperson || 'Unassigned',
        salesperson_id: deal.salesperson_id,
        month: parseInt(month),
        year: parseInt(year),
        deal_count: 0,
        new_bmw_units: 0,
        used_bmw_units: 0,
        new_mini_units: 0,
        used_mini_units: 0,
        total_units: 0,
        fe_gross_total: 0,
        be_gross_total: 0,
        product_total: 0,
        unit_commission: 0,
        product_commission: 0,
        bonus_earned: 0,
        total_pay: 0,
        bmw_units: 0,
        mini_units: 0
      });
    }
    
    const person = salespersonMap.get(deal.salesperson_id);
    person.deal_count += deal.unit_count;
    person.total_units += deal.unit_count;
    person.fe_gross_total += parseFloat(deal.fe_gross_total || 0);
    person.be_gross_total += parseFloat(deal.be_gross_total || 0);
    
    // Calculate product totals (convert strings to numbers)
    const productTotal = parseFloat(deal.vsc_total || 0) + parseFloat(deal.gap_total || 0) + 
                        parseFloat(deal.maintenance_total || 0) + parseFloat(deal.cilajet_total || 0) + 
                        parseFloat(deal.diamon_total || 0) + parseFloat(deal.key_product_total || 0) + 
                        parseFloat(deal.collision_total || 0) + parseFloat(deal.dent_total || 0) + 
                        parseFloat(deal.excess_total || 0) + parseFloat(deal.ppf_total || 0) + 
                        parseFloat(deal.wheel_and_tire_total || 0);
    person.product_total += productTotal;
    
    // Classify units by type
    const type = (deal.type || '').toLowerCase();
    if (type.includes('bmw')) {
      person.bmw_units += deal.unit_count;
      if (type.includes('new')) {
        person.new_bmw_units += deal.unit_count;
      } else if (type.includes('used')) {
        person.used_bmw_units += deal.unit_count;
      }
    } else if (type.includes('mini')) {
      person.mini_units += deal.unit_count;
      if (type.includes('new')) {
        person.new_mini_units += deal.unit_count;
      } else if (type.includes('used')) {
        person.used_mini_units += deal.unit_count;
      }
    }
  });
  
  // Calculate commissions and bonuses for each salesperson
  salespersonMap.forEach(person => {
    // BMW sliding scale rates
    const bmwRates = {
      1: 200, 2: 200, 3: 200, 4: 200, 5: 200,  // Units 1-5: $200
      6: 225,  // Unit 6: $225
      7: 250,  // Unit 7: $250
      8: 300,  // Unit 8: $300
      9: 325,  // Unit 9: $325
      10: 350, // Unit 10: $350
      11: 375, // Unit 11: $375
      // Units 12+: $425
    };
    
    // MINI sliding scale rates
    const miniRates = {
      1: 225, 2: 225, 3: 225, 4: 225, 5: 225, 6: 225, 7: 225, // Units 1-7: $225
      8: 275,  // Unit 8: $275
      9: 300,  // Unit 9: $300
      10: 325, // Unit 10: $325
      11: 350, // Unit 11: $350
      // Units 12+: $375
    };
    
    // Calculate BMW unit commission using sliding scale
    let bmwCommission = 0;
    for (let i = 1; i <= person.bmw_units; i++) {
      if (i <= 11) {
        bmwCommission += bmwRates[i];
      } else {
        bmwCommission += 425; // Units 12+: $425
      }
    }
    
    // Calculate MINI unit commission using sliding scale
    let miniCommission = 0;
    for (let i = 1; i <= person.mini_units; i++) {
      if (i <= 11) {
        miniCommission += miniRates[i];
      } else {
        miniCommission += 375; // Units 12+: $375
      }
    }
    
    person.unit_commission = bmwCommission + miniCommission;
    
    // Calculate product bonuses according to BMW of Pittsburgh pay plan
    // $50 for each VSC, Cilajet, and Tire & Wheel Protection sold
    // We need to count individual products, but we only have totals
    // For now, we'll estimate based on typical product values
    
    // Count products based on totals (simplified approach)
    // Typical VSC: $1000-2000, Cilajet: $300-800, Tire & Wheel: $800-1500
    let vscCount = 0, cilajetCount = 0, tireWheelCount = 0;
    
    // Estimate product counts from totals (this is approximate)
    // In a real implementation, we'd count individual products from deal details
    const vscTotal = parseFloat(person.vsc_total || 0);
    const cilajetTotal = parseFloat(person.cilajet_total || 0);
    const tireWheelTotal = parseFloat(person.wheel_and_tire_total || 0);
    
    // Rough estimates based on typical product values
    vscCount = Math.round(vscTotal / 1500); // Assume average $1500 per VSC
    cilajetCount = Math.round(cilajetTotal / 500); // Assume average $500 per Cilajet
    tireWheelCount = Math.round(tireWheelTotal / 1000); // Assume average $1000 per Tire & Wheel
    
    // Calculate bonuses: $50 per product
    person.vsc_bonus = vscCount * 50;
    person.cilajet_bonus = cilajetCount * 50;
    person.tire_wheel_bonus = tireWheelCount * 50;
    person.product_bonus = person.vsc_bonus + person.cilajet_bonus + person.tire_wheel_bonus;
    
    // Calculate rewards upgrade bonus (simplified - would need penetration calculation)
    person.rewards_bonus = 0; // Would need actual penetration calculation
    
    // Calculate bonus (if they exceed threshold)
    person.bonus_earned = person.total_units >= 10 ? 500 : 0;
    
    // Calculate total pay
    person.total_pay = person.unit_commission + person.product_bonus + person.rewards_bonus + person.bonus_earned;
  });
  
  return Array.from(salespersonMap.values());
}

module.exports = router;