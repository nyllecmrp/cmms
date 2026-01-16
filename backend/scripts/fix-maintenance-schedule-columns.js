/**
 * Fix MaintenanceSchedule table to add missing completedDate column
 */
const { Database } = require('@sqlitecloud/drivers');

const DATABASE_URL = 'sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24';

async function fixMaintenanceScheduleTable() {
  const db = new Database(DATABASE_URL);

  try {
    console.log('🔍 Checking MaintenanceSchedule table structure...');

    // Check current columns
    const tableInfo = await db.sql('PRAGMA table_info(MaintenanceSchedule)');
    console.log('Current columns:', tableInfo.map(col => col.name).join(', '));

    const hasCompletedDate = tableInfo.some(col => col.name === 'completedDate');
    const hasPartNumber = tableInfo.some(col => col.name === 'partNumber');
    const hasPartName = tableInfo.some(col => col.name === 'partName');
    const hasOrganizationId = tableInfo.some(col => col.name === 'organizationId');

    if (!hasCompletedDate) {
      console.log('❌ completedDate column is missing');
      console.log('✅ Adding completedDate column...');
      await db.sql('ALTER TABLE MaintenanceSchedule ADD COLUMN completedDate TEXT');
    } else {
      console.log('✅ completedDate column already exists');
    }

    if (!hasPartNumber) {
      console.log('❌ partNumber column is missing');
      console.log('✅ Adding partNumber column...');
      await db.sql('ALTER TABLE MaintenanceSchedule ADD COLUMN partNumber TEXT');
    } else {
      console.log('✅ partNumber column already exists');
    }

    if (!hasPartName) {
      console.log('❌ partName column is missing');
      console.log('✅ Adding partName column...');
      await db.sql('ALTER TABLE MaintenanceSchedule ADD COLUMN partName TEXT');
    } else {
      console.log('✅ partName column already exists');
    }

    if (!hasOrganizationId) {
      console.log('❌ organizationId column is missing');
      console.log('✅ Adding organizationId column...');
      await db.sql('ALTER TABLE MaintenanceSchedule ADD COLUMN organizationId TEXT');
    } else {
      console.log('✅ organizationId column already exists');
    }

    // Verify final structure
    const finalTableInfo = await db.sql('PRAGMA table_info(MaintenanceSchedule)');
    console.log('\n✅ Final table structure:');
    finalTableInfo.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

    console.log('\n✅ MaintenanceSchedule table fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing table:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

fixMaintenanceScheduleTable();
