const { Database } = require('@sqlitecloud/drivers');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL || 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

  console.log('🔌 Connecting to SQLite Cloud...');
  const db = new Database(dbUrl);

  try {
    const migrationPath = path.join(__dirname, '../database/migrations/002_add_phase2_phase3_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running Phase 2/3 migration...');

    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        console.log(`  Executing: ${statement.substring(0, 50)}...`);
        await db.sql`${statement}`;
      }
    }

    console.log('✅ Migration completed successfully!');

    // Verify tables exist
    const tables = await db.sql("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('Notification', 'DataArchive', 'Subscription', 'Payment', 'Invoice', 'ModuleAccessLog')");
    console.log('📊 Created tables:', tables.map(t => t.name).join(', '));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigration();
