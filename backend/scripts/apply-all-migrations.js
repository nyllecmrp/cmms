const { Database } = require('@sqlitecloud/drivers');
const fs = require('fs');
const path = require('path');

async function applyAllMigrations() {
  const connectionString = process.env.DATABASE_URL || 'sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24';

  console.log('🔌 Connecting to database...');
  const db = new Database(connectionString);

  try {
    const migrations = [
      '003_add_inventory_tables.sql',
      '004_add_asset_parts.sql',
      '005_add_wcm_machine_ledger.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`\n📄 Applying migration: ${migrationFile}`);

      const migrationPath = path.join(__dirname, '../database/migrations', migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      try {
        await db.sql(migrationSQL);
        console.log(`✅ ${migrationFile} applied successfully`);
      } catch (error) {
        if (error.message && error.message.includes('already exists')) {
          console.log(`⚠️  ${migrationFile} - Tables already exist, skipping`);
        } else {
          console.error(`❌ ${migrationFile} failed:`, error.message);
          // Continue with next migration
        }
      }
    }

    console.log('\n\n✅ All migrations completed!');

  } catch (error) {
    console.error('❌ Migration process failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

applyAllMigrations().then(() => {
  console.log('✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
