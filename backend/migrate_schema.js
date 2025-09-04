const pool = require('./db');

async function migrateSchema() {
  try {
    console.log('Starting schema migration...');
    
    // Add funded and funded_timestamp columns to deals table
    console.log('Adding funded and funded_timestamp columns to deals table...');
    
    // Check if columns already exist
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'deals' 
      AND COLUMN_NAME IN ('funded', 'funded_timestamp')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (!existingColumns.includes('funded')) {
      await pool.query('ALTER TABLE deals ADD COLUMN funded BOOLEAN DEFAULT FALSE');
      console.log('Added funded column');
    } else {
      console.log('funded column already exists');
    }
    
    if (!existingColumns.includes('funded_timestamp')) {
      await pool.query('ALTER TABLE deals ADD COLUMN funded_timestamp TIMESTAMP NULL');
      console.log('Added funded_timestamp column');
    } else {
      console.log('funded_timestamp column already exists');
    }
    
    // Update existing records to set funded based on funded_date
    console.log('Updating existing records...');
    await pool.query(`
      UPDATE deals 
      SET funded = CASE WHEN funded_date IS NOT NULL THEN TRUE ELSE FALSE END,
          funded_timestamp = CASE WHEN funded_date IS NOT NULL THEN funded_date ELSE NULL END
      WHERE funded IS NULL OR funded_timestamp IS NULL
    `);
    
    console.log('Schema migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateSchema();
