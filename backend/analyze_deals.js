const pool = require('./db.js');

async function analyzeDeals() {
  try {
    console.log('Starting comprehensive deal analysis...');
    const connection = await pool.getConnection();
    
    console.log('\n=== COMPREHENSIVE DEAL ANALYSIS ===');
    
    // Total deals
    const [totalDeals] = await connection.execute('SELECT COUNT(*) as total FROM deals');
    console.log(`Total deals: ${totalDeals[0].total}`);
    
    // Deals with no external_id
    const [noExternalId] = await connection.execute('SELECT COUNT(*) as count FROM deals WHERE external_id IS NULL');
    console.log(`Deals with no external_id: ${noExternalId[0].count}`);
    
    // Deals with no date
    const [noDate] = await connection.execute('SELECT COUNT(*) as count FROM deals WHERE date IS NULL');
    console.log(`Deals with no date: ${noDate[0].count}`);
    
    // Deals with no name
    const [noName] = await connection.execute('SELECT COUNT(*) as count FROM deals WHERE name IS NULL OR name = ""');
    console.log(`Deals with no name: ${noName[0].count}`);
    
    // Deals with no stock_number
    const [noStockNumber] = await connection.execute('SELECT COUNT(*) as count FROM deals WHERE stock_number IS NULL OR stock_number = ""');
    console.log(`Deals with no stock_number: ${noStockNumber[0].count}`);
    
    // Deals with no salesperson
    const [noSalesperson] = await connection.execute('SELECT COUNT(*) as count FROM deals WHERE salesperson_id IS NULL');
    console.log(`Deals with no salesperson: ${noSalesperson[0].count}`);
    
    // Deals with no financial data (all money fields NULL)
    const [noFinancialData] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM deals 
      WHERE fe_gross IS NULL 
        AND avp IS NULL 
        AND be_gross IS NULL 
        AND reserve IS NULL 
        AND rewards IS NULL 
        AND vsc IS NULL 
        AND maintenance IS NULL 
        AND gap IS NULL 
        AND cilajet IS NULL 
        AND diamon IS NULL 
        AND key_product IS NULL 
        AND collision_product IS NULL 
        AND dent_product IS NULL 
        AND excess IS NULL 
        AND ppf IS NULL 
        AND wheel_and_tire IS NULL 
        AND money IS NULL 
        AND titling IS NULL 
        AND mileage IS NULL 
        AND license_insurance IS NULL 
        AND fees IS NULL
    `);
    console.log(`Deals with no financial data: ${noFinancialData[0].count}`);
    
    // Deals with minimal data (just ID and maybe external_id)
    const [minimalData] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM deals 
      WHERE (name IS NULL OR name = "") 
        AND (stock_number IS NULL OR stock_number = "") 
        AND salesperson_id IS NULL 
        AND date IS NULL 
        AND fe_gross IS NULL 
        AND avp IS NULL 
        AND be_gross IS NULL
    `);
    console.log(`Deals with minimal data: ${minimalData[0].count}`);
    
    // Show sample of deals with minimal data
    if (minimalData[0].count > 0) {
      console.log('\n=== SAMPLE DEALS WITH MINIMAL DATA ===');
      const [sampleMinimal] = await connection.execute(`
        SELECT id, external_id, date, name, stock_number, salesperson_id, fe_gross, avp, be_gross
        FROM deals 
        WHERE (name IS NULL OR name = "") 
          AND (stock_number IS NULL OR stock_number = "") 
          AND salesperson_id IS NULL 
          AND date IS NULL 
          AND fe_gross IS NULL 
          AND avp IS NULL 
          AND be_gross IS NULL
        LIMIT 10
      `);
      console.table(sampleMinimal);
    }
    
    // Check for deals with empty strings instead of NULL
    console.log('\n=== DEALS WITH EMPTY STRINGS ===');
    const [emptyName] = await connection.execute('SELECT COUNT(*) as count FROM deals WHERE name = ""');
    console.log(`Deals with empty name: ${emptyName[0].count}`);
    
    const [emptyStockNumber] = await connection.execute('SELECT COUNT(*) as count FROM deals WHERE stock_number = ""');
    console.log(`Deals with empty stock_number: ${emptyStockNumber[0].count}`);
    
    const [emptyBank] = await connection.execute('SELECT COUNT(*) as count FROM deals WHERE bank = ""');
    console.log(`Deals with empty bank: ${emptyBank[0].count}`);
    
    // Show distribution by year
    console.log('\n=== DEALS BY YEAR ===');
    const [dealsByYear] = await connection.execute(`
      SELECT year, COUNT(*) as count 
      FROM deals 
      WHERE year IS NOT NULL 
      GROUP BY year 
      ORDER BY year DESC
    `);
    console.table(dealsByYear);
    
    // Show distribution by month
    console.log('\n=== DEALS BY MONTH (CURRENT YEAR) ===');
    const currentYear = new Date().getFullYear();
    const [dealsByMonth] = await connection.execute(`
      SELECT month, COUNT(*) as count 
      FROM deals 
      WHERE year = ? AND month IS NOT NULL
      GROUP BY month 
      ORDER BY month
    `, [currentYear]);
    console.table(dealsByMonth);
    
    connection.release();
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

analyzeDeals();
