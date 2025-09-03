const pool = require('./db.js');

async function checkSpecificDeal() {
  try {
    console.log('Checking specific deal 60311...');
    const connection = await pool.getConnection();
    
    // Get all details for deal 60311
    const [deal] = await connection.execute(`
      SELECT * FROM deals WHERE id = 60311
    `);
    
    if (deal.length === 0) {
      console.log('Deal 60311 not found');
      return;
    }
    
    console.log('\n=== DEAL 60311 DETAILS ===');
    console.table(deal[0]);
    
    // Also check deals with similar characteristics
    console.log('\n=== FINDING SIMILAR BLANK DEALS ===');
    
    // Get the deal data to analyze what makes it "blank"
    const dealData = deal[0];
    
    // Find deals with similar blank characteristics
    const [similarDeals] = await connection.execute(`
      SELECT id, external_id, date, name, stock_number, salesperson_id, fe_gross, avp, be_gross
      FROM deals 
      WHERE (name IS NULL OR name = "" OR name = ?)
        AND (stock_number IS NULL OR stock_number = "" OR stock_number = ?)
        AND (salesperson_id IS NULL OR salesperson_id = ?)
        AND (date IS NULL OR date = ?)
        AND (fe_gross IS NULL OR fe_gross = ?)
        AND (avp IS NULL OR avp = ?)
        AND (be_gross IS NULL OR be_gross = ?)
      LIMIT 20
    `, [dealData.name, dealData.stock_number, dealData.salesperson_id, dealData.date, dealData.fe_gross, dealData.avp, dealData.be_gross]);
    
    console.log(`Found ${similarDeals.length} similar deals:`);
    console.table(similarDeals);
    
    // Count total similar deals
    const [countSimilar] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM deals 
      WHERE (name IS NULL OR name = "" OR name = ?)
        AND (stock_number IS NULL OR stock_number = "" OR stock_number = ?)
        AND (salesperson_id IS NULL OR salesperson_id = ?)
        AND (date IS NULL OR date = ?)
        AND (fe_gross IS NULL OR fe_gross = ?)
        AND (avp IS NULL OR avp = ?)
        AND (be_gross IS NULL OR be_gross = ?)
    `, [dealData.name, dealData.stock_number, dealData.salesperson_id, dealData.date, dealData.fe_gross, dealData.avp, dealData.be_gross]);
    
    console.log(`\nTotal similar blank deals: ${countSimilar[0].count}`);
    
    connection.release();
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSpecificDeal();
