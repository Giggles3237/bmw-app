const fs = require('fs');
const path = require('path');
const pool = require('./db');

/**
 * Fixed migration script to set up spiff management system
 * This version handles SQL parsing more robustly
 */
async function migrateSpiffs() {
  try {
    console.log('Starting spiff system migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'spiff_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Clean up the schema - remove comments and split by semicolons
    const cleanSchema = schema
      .replace(/--.*$/gm, '') // Remove line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .trim();
    
    // Split by semicolons and filter out empty statements
    const statements = cleanSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}: ${statement.substring(0, 50)}...`);
          await pool.query(statement);
          console.log(`✓ Executed statement ${i + 1}`);
        } catch (err) {
          // Ignore errors for table creation (might already exist)
          if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_ENTRY') {
            console.log(`⚠ Statement ${i + 1} skipped (already exists)`);
          } else {
            console.error(`✗ Error executing statement ${i + 1}:`, err.message);
            console.error(`Statement was: ${statement}`);
            throw err;
          }
        }
      }
    }
    
    console.log('✅ Spiff system migration completed successfully!');
    
    // Verify the migration
    console.log('\nVerifying migration...');
    
    try {
      const [categories] = await pool.query('SELECT COUNT(*) as count FROM spiff_categories');
      const [types] = await pool.query('SELECT COUNT(*) as count FROM spiff_types');
      
      console.log(`📊 Spiff categories created: ${categories[0].count}`);
      console.log(`📊 Spiff types created: ${types[0].count}`);
      
      // Show sample data
      const [sampleCategories] = await pool.query(`
        SELECT sc.name as category, COUNT(st.id) as type_count
        FROM spiff_categories sc
        LEFT JOIN spiff_types st ON sc.id = st.category_id
        GROUP BY sc.id, sc.name
        ORDER BY sc.name
      `);
      
      console.log('\n📋 Spiff Categories and Types:');
      sampleCategories.forEach(cat => {
        console.log(`  • ${cat.category}: ${cat.type_count} types`);
      });
      
    } catch (verifyErr) {
      console.error('❌ Verification failed:', verifyErr.message);
      throw verifyErr;
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateSpiffs()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateSpiffs;
