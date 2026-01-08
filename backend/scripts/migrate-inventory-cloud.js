/**
 * Run Inventory Migration on SQLite Cloud
 */

const { Database } = require('@sqlitecloud/drivers');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

async function runMigration() {
  const db = new Database(connectionString);

  console.log('🔌 Connecting to SQLite Cloud...');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/003_add_inventory_tables.sql');
    let migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Remove comments
    migrationSQL = migrationSQL.replace(/--.*$/gm, '');

    console.log('📄 Running inventory migration on cloud database...\n');

    // Split by CREATE/INDEX keywords to keep statements together
    const createStatements = [];
    const indexStatements = [];

    let currentStatement = '';
    const lines = migrationSQL.split('\n');

    for (const line of lines) {
      currentStatement += line + '\n';

      if (line.trim().endsWith(');')) {
        const stmt = currentStatement.trim();
        if (stmt.startsWith('CREATE TABLE') || stmt.startsWith('CREATE INDEX')) {
          if (stmt.includes('CREATE INDEX')) {
            indexStatements.push(stmt);
          } else {
            createStatements.push(stmt);
          }
          currentStatement = '';
        }
      }
    }

    // Run table creations first
    console.log('Creating tables...');
    for (const statement of createStatements) {
      if (statement.trim()) {
        const tableName = statement.match(/CREATE TABLE.*?(\\w+)/)?.[1] || 'unknown';
        console.log(`  Creating table: ${tableName}`);
        await db.sql(statement);
      }
    }

    // Then run index creations
    console.log('\nCreating indexes...');
    for (const statement of indexStatements) {
      if (statement.trim()) {
        try {
          await db.sql(statement);
        } catch (err) {
          // Ignore index errors (might already exist)
          if (!err.message.includes('already exists')) {
            console.warn(`  Warning: ${err.message}`);
          }
        }
      }
    }

    console.log('\n✅ Inventory migration completed successfully on SQLite Cloud!');

    // Verify tables created
    console.log('\n🔍 Verifying tables...');
    const tables = await db.sql(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND (name LIKE 'Inventory%' OR name LIKE 'Stock%')
      ORDER BY name
    `);

    console.log('Created tables:');
    tables.forEach(table => console.log(`  ✓ ${table.name}`));

    // Initialize stock locations
    console.log('\n📦 Initializing stock locations for organizations...');
    const orgs = await db.sql('SELECT id, name FROM Organization');

    for (const org of orgs) {
      const existing = await db.sql('SELECT id FROM StockLocation WHERE organizationId = ? AND isDefault = 1', org.id);
      if (existing.length === 0) {
        const { randomUUID } = require('crypto');
        await db.sql(`
          INSERT INTO StockLocation (
            id, organizationId, name, address, isDefault, isActive, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, 1, 1, datetime('now'), datetime('now'))
        `, randomUUID(), org.id, 'Main Warehouse', 'Default warehouse location');
        console.log(`  ✓ Created default stock location for ${org.name}`);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

runMigration();
