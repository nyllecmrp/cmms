const Database = require('@sqlitecloud/drivers').Database;
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24';

async function applyMigration() {
  console.log('🔄 Connecting to database...');
  const db = new Database(DATABASE_URL);

  try {
    const migrationPath = path.join(__dirname, '../database/migrations/007_add_sap_number_to_asset_parts.sql');
    console.log('📄 Reading migration file:', migrationPath);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and filter out comments and empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⚙️  Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + '...');

      await db.sql`${statement}`;
      console.log('✅ Success');
    }

    console.log('\n🎉 Migration 007 applied successfully!');
    console.log('✅ Added sapNumber column to AssetPart table');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

applyMigration()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
