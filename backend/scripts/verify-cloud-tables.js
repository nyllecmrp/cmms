const { Database } = require('@sqlitecloud/drivers');

async function verifyTables() {
  const dbUrl = process.env.DATABASE_URL || 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

  console.log('🔌 Connecting to SQLite Cloud...');
  const db = new Database(dbUrl);

  try {
    // List all tables
    console.log('\n📊 Listing all tables in the database:');
    const tables = await db.sql`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`;
    console.log('Tables found:', tables);

    // Check specifically for Phase 2/3 tables
    const phase23Tables = ['Notification', 'DataArchive', 'Subscription', 'Payment', 'Invoice', 'ModuleAccessLog'];
    console.log('\n🔍 Checking for Phase 2/3 tables:');
    for (const tableName of phase23Tables) {
      const result = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name=${tableName}`;
      console.log(`  ${tableName}: ${result.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
    }

    // Try to query Notification table
    console.log('\n📝 Attempting to query Notification table:');
    try {
      const notifications = await db.sql`SELECT * FROM Notification LIMIT 1`;
      console.log('  ✅ Successfully queried Notification table');
    } catch (error) {
      console.log('  ❌ Failed to query Notification table:', error.message);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

verifyTables();
