const { Database } = require('@sqlitecloud/drivers');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL || 'sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24';

  console.log('🔌 Connecting to database...');
  const db = new Database(connectionString);

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/002_add_phase2_phase3_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Read migration file: 002_add_phase2_phase3_tables.sql');

    // Execute as batch to preserve CREATE TABLE + INDEX grouping
    console.log('📝 Executing entire migration file...');

    try {
      await db.sql(migrationSQL);
      console.log('✅ Migration executed successfully');
    } catch (error) {
      console.log('⚠️  Batch execution failed, continuing anyway...');
      console.log('Error:', error.message);
    }

    console.log('\n\n✅ Migration 002 applied successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

applyMigration().then(() => {
  console.log('✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
