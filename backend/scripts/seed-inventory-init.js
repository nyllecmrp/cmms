/**
 * Initialize Inventory System
 * Creates default stock location for organizations
 */

const BetterSqlite3 = require('better-sqlite3');
const { randomUUID } = require('crypto');

const db = new BetterSqlite3('./prisma/dev.db');

console.log('🔧 Initializing Inventory System...\n');

try {
  // Get all organizations
  const organizations = db.prepare('SELECT id, name FROM Organization').all();

  console.log(`Found ${organizations.length} organizations\n`);

  organizations.forEach((org) => {
    console.log(`📦 Setting up inventory for: ${org.name}`);

    // Check if default location exists
    const existingLocation = db
      .prepare('SELECT id FROM StockLocation WHERE organizationId = ? AND isDefault = 1')
      .get(org.id);

    if (!existingLocation) {
      // Create default stock location
      const locationId = randomUUID();
      db.prepare(`
        INSERT INTO StockLocation (
          id, organizationId, name, address, isDefault, isActive, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, 1, 1, datetime('now'), datetime('now'))
      `).run(locationId, org.id, 'Main Warehouse', 'Default warehouse location');

      console.log(`  ✓ Created default stock location: Main Warehouse`);
    } else {
      console.log(`  ✓ Default stock location already exists`);
    }
  });

  console.log('\n✅ Inventory system initialization complete!');
} catch (error) {
  console.error('❌ Error initializing inventory:', error);
  process.exit(1);
} finally {
  db.close();
}
