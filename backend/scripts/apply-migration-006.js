const { Database } = require('@sqlitecloud/drivers');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL || 'sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24';

  console.log('🔌 Connecting to database...');
  const db = new Database(connectionString);

  try {
    console.log('📄 Applying migration: 006_enhance_asset_parts_for_bom.sql');

    const migrationPath = path.join(__dirname, '../database/migrations/006_enhance_asset_parts_for_bom.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await db.sql(migrationSQL);
    console.log('✅ Migration 006 applied successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
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
