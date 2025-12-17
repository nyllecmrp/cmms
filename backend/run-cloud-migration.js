const { Database } = require('@sqlitecloud/drivers');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

  console.log('🔌 Connecting to SQLite Cloud...');
  const db = new Database(connectionString);

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'prisma', 'migrations', 'add_purchase_orders.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration: add_purchase_orders.sql');

    // Split by semicolon and run each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log(`  Executing: ${statement.substring(0, 50)}...`);
      await db.sql(statement);
    }

    console.log('✅ Migration completed successfully!');

    // Verify table was created
    const result = await db.sql("SELECT name FROM sqlite_master WHERE type='table' AND name='PurchaseOrder'");
    console.log('✅ PurchaseOrder table verified:', result);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigration();
