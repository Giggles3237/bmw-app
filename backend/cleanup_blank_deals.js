const pool = require('./db.js');

async function cleanupBlankDeals() {
  try {
    console.log('Starting cleanup script...');
    console.log('Connecting to database...');
    
    // Test the connection first
    const connection = await pool.getConnection();
    console.log('Database connection successful!');
    
    // First, let's see what we're dealing with
    console.log('\n=== ANALYZING BLANK DEALS ===');
    
    // Count total deals
    const [totalDeals] = await connection.execute('SELECT COUNT(*) as total FROM deals');
    console.log(`Total deals in database: ${totalDeals[0].total}`);
    
    // Count deals with minimal data (just ID and external_id)
    const [minimalDeals] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM deals 
      WHERE external_id IS NULL 
        AND date IS NULL 
        AND month IS NULL 
        AND year IS NULL 
        AND bank IS NULL 
        AND funded_date IS NULL 
        AND stock_number IS NULL 
        AND name IS NULL 
        AND salesperson_id IS NULL 
        AND split IS NULL 
        AND type IS NULL 
        AND used_car_source IS NULL 
        AND age IS NULL 
        AND fe_gross IS NULL 
        AND avp IS NULL 
        AND be_gross IS NULL 
        AND finance_manager_id IS NULL 
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
        AND product_count IS NULL 
        AND money IS NULL 
        AND titling IS NULL 
        AND mileage IS NULL 
        AND license_insurance IS NULL 
        AND fees IS NULL 
        AND clean IS NULL 
        AND payoff_flag IS NULL 
        AND payoff_sent IS NULL 
        AND atc_flag IS NULL 
        AND registration_sent IS NULL 
        AND notes IS NULL 
        AND split2 IS NULL
    `);
    
    console.log(`Deals with no meaningful data: ${minimalDeals[0].count}`);
    
    // Count deals with only external_id but no other meaningful data
    const [externalIdOnlyDeals] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM deals 
      WHERE external_id IS NOT NULL 
        AND date IS NULL 
        AND month IS NULL 
        AND year IS NULL 
        AND bank IS NULL 
        AND funded_date IS NULL 
        AND stock_number IS NULL 
        AND name IS NULL 
        AND salesperson_id IS NULL 
        AND split IS NULL 
        AND type IS NULL 
        AND used_car_source IS NULL 
        AND age IS NULL 
        AND fe_gross IS NULL 
        AND avp IS NULL 
        AND be_gross IS NULL 
        AND finance_manager_id IS NULL 
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
        AND product_count IS NULL 
        AND money IS NULL 
        AND titling IS NULL 
        AND mileage IS NULL 
        AND license_insurance IS NULL 
        AND fees IS NULL 
        AND clean IS NULL 
        AND payoff_flag IS NULL 
        AND payoff_sent IS NULL 
        AND atc_flag IS NULL 
        AND registration_sent IS NULL 
        AND notes IS NULL 
        AND split2 IS NULL
    `);
    
    console.log(`Deals with only external_id: ${externalIdOnlyDeals[0].count}`);
    
    // Show a sample of blank deals
    console.log('\n=== SAMPLE BLANK DEALS ===');
    const [sampleBlankDeals] = await connection.execute(`
      SELECT id, external_id, date, name, stock_number, salesperson_id
      FROM deals 
      WHERE external_id IS NULL 
        AND date IS NULL 
        AND month IS NULL 
        AND year IS NULL 
        AND bank IS NULL 
        AND funded_date IS NULL 
        AND stock_number IS NULL 
        AND name IS NULL 
        AND salesperson_id IS NULL 
        AND split IS NULL 
        AND type IS NULL 
        AND used_car_source IS NULL 
        AND age IS NULL 
        AND fe_gross IS NULL 
        AND avp IS NULL 
        AND be_gross IS NULL 
        AND finance_manager_id IS NULL 
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
        AND product_count IS NULL 
        AND money IS NULL 
        AND titling IS NULL 
        AND mileage IS NULL 
        AND license_insurance IS NULL 
        AND fees IS NULL 
        AND clean IS NULL 
        AND payoff_flag IS NULL 
        AND payoff_sent IS NULL 
        AND atc_flag IS NULL 
        AND registration_sent IS NULL 
        AND notes IS NULL 
        AND split2 IS NULL
      LIMIT 10
    `);
    
    console.table(sampleBlankDeals);
    
    // Ask for confirmation before deletion
    console.log('\n=== CONFIRMATION REQUIRED ===');
    console.log(`This will delete ${minimalDeals[0].count} blank deals from the database.`);
    console.log('To proceed with deletion, run this script with the --delete flag:');
    console.log('node cleanup_blank_deals.js --delete');
    
    // Check if --delete flag is provided
    if (process.argv.includes('--delete')) {
      console.log('\n=== DELETING BLANK DEALS ===');
      
      const [deleteResult] = await connection.execute(`
        DELETE FROM deals 
        WHERE external_id IS NULL 
          AND date IS NULL 
          AND month IS NULL 
          AND year IS NULL 
          AND bank IS NULL 
          AND funded_date IS NULL 
          AND stock_number IS NULL 
          AND name IS NULL 
          AND salesperson_id IS NULL 
          AND split IS NULL 
          AND type IS NULL 
          AND used_car_source IS NULL 
          AND age IS NULL 
          AND fe_gross IS NULL 
          AND avp IS NULL 
          AND be_gross IS NULL 
          AND finance_manager_id IS NULL 
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
          AND product_count IS NULL 
          AND money IS NULL 
          AND titling IS NULL 
          AND mileage IS NULL 
          AND license_insurance IS NULL 
          AND fees IS NULL 
          AND clean IS NULL 
          AND payoff_flag IS NULL 
          AND payoff_sent IS NULL 
          AND atc_flag IS NULL 
          AND registration_sent IS NULL 
          AND notes IS NULL 
          AND split2 IS NULL
      `);
      
      console.log(`Successfully deleted ${deleteResult.affectedRows} blank deals.`);
      
      // Verify the deletion
      const [remainingDeals] = await connection.execute('SELECT COUNT(*) as total FROM deals');
      console.log(`Remaining deals in database: ${remainingDeals[0].total}`);
    }
    
    connection.release();
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

cleanupBlankDeals();
