const { Database } = require('@sqlitecloud/drivers');

const dbUrl = 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

async function addMaintenancePartsField() {
  console.log('🔌 Connecting to database...');
  const db = new Database(dbUrl);

  try {
    // Check current Asset table structure
    console.log('\n📋 Current Asset table structure:');
    const tableInfo = db.sql('PRAGMA table_info(Asset)');
    console.log('Raw table info:', JSON.stringify(tableInfo, null, 2));

    const columns = Array.isArray(tableInfo) ? tableInfo : (tableInfo.data || []);
    console.log(columns.map(col => `  - ${col.name} (${col.type})`).join('\n'));

    // Check if maintenanceParts field exists
    const hasMaintenanceParts = columns.some(col => col.name === 'maintenanceParts');

    if (hasMaintenanceParts) {
      console.log('\n✅ maintenanceParts field already exists!');
    } else {
      console.log('\n➕ Adding maintenanceParts field to Asset table...');
      db.sql(`ALTER TABLE Asset ADD COLUMN maintenanceParts TEXT`);
      console.log('✅ maintenanceParts field added successfully!');

      // Verify
      const updatedTableInfo = db.sql('PRAGMA table_info(Asset)');
      const updatedColumns = Array.isArray(updatedTableInfo) ? updatedTableInfo : (updatedTableInfo.data || []);
      console.log('\n📋 Updated Asset table structure:');
      console.log(updatedColumns.map(col => `  - ${col.name} (${col.type})`).join('\n'));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close();
    console.log('\n🔌 Database connection closed');
  }
}

addMaintenancePartsField();
