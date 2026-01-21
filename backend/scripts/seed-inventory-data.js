const { Database } = require('@sqlitecloud/drivers');
const { randomUUID } = require('crypto');

const connectionString = process.env.DATABASE_URL || 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/auth.sqlitecloud?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

async function seedInventoryData() {
  console.log('🌱 Seeding inventory data...\n');

  const db = new Database(connectionString);

  try {
    // Get organization ID
    const orgs = await db.sql`SELECT id FROM Organization LIMIT 1`;
    const organizationId = orgs[0]?.id || 'org-test-1';
    console.log(`📦 Using organization: ${organizationId}\n`);

    // Get a user for createdBy
    const users = await db.sql`SELECT id FROM User WHERE organizationId = ${organizationId} LIMIT 1`;
    const userId = users[0]?.id;

    if (!userId) {
      console.error('❌ No user found in organization');
      return;
    }

    // Create inventory categories first
    const categories = [
      { id: randomUUID(), name: 'Filters', description: 'All types of filters' },
      { id: randomUUID(), name: 'Bearings', description: 'Bearings and bushings' },
      { id: randomUUID(), name: 'Pumps', description: 'Hydraulic and coolant pumps' },
      { id: randomUUID(), name: 'Electrical', description: 'Motors and electrical components' },
      { id: randomUUID(), name: 'Tooling', description: 'Cutting tools and accessories' },
      { id: randomUUID(), name: 'Fasteners', description: 'Screws, bolts, and hardware' },
    ];

    console.log('📁 Creating inventory categories...');
    for (const category of categories) {
      await db.sql`
        INSERT OR IGNORE INTO InventoryCategory (id, organizationId, name, description, createdAt, updatedAt)
        VALUES (${category.id}, ${organizationId}, ${category.name}, ${category.description}, datetime('now'), datetime('now'))
      `;
    }
    console.log(`✅ Created ${categories.length} categories\n`);

    // Create stock locations
    const locations = [
      { id: randomUUID(), name: 'Main Warehouse', code: 'WH-MAIN' },
      { id: randomUUID(), name: 'Production Floor', code: 'PROD-01' },
      { id: randomUUID(), name: 'Maintenance Shop', code: 'MAINT-01' },
    ];

    console.log('📍 Creating stock locations...');
    for (const location of locations) {
      await db.sql`
        INSERT OR IGNORE INTO StockLocation (id, organizationId, name, locationCode, isActive, createdAt, updatedAt)
        VALUES (${location.id}, ${organizationId}, ${location.name}, ${location.code}, 1, datetime('now'), datetime('now'))
      `;
    }
    console.log(`✅ Created ${locations.length} stock locations\n`);

    // Map categories by name for easy lookup
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.name] = c.id);

    // Sample inventory items that match PM schedule parts
    const inventoryItems = [
      // CNC Machine Parts
      { partNumber: 'SPD-1000', name: 'Spindle Motor Drive', category: 'Electrical', unitCost: 2500, minStock: 1, reorderPoint: 1, stock: 2 },
      { partNumber: 'CPP-2500-B', name: 'Coolant Pump (Important)', category: 'Pumps', unitCost: 450, minStock: 2, reorderPoint: 2, stock: 5 },
      { partNumber: 'BSC-4040-X', name: 'X-Axis Ball Screw (Critical)', category: 'Bearings', unitCost: 1200, minStock: 1, reorderPoint: 1, stock: 1 },
      { partNumber: 'SPD-BRG-8000', name: 'Spindle Bearing Set', category: 'Bearings', unitCost: 800, minStock: 1, reorderPoint: 2, stock: 3 },
      { partNumber: 'HYD-FLT-10', name: 'Hydraulic Filter', category: 'Filters', unitCost: 85, minStock: 5, reorderPoint: 8, stock: 12 },
      { partNumber: 'ATC-20-CAP', name: 'Automatic Tool Changer', category: 'Tooling', unitCost: 3500, minStock: 0, reorderPoint: 1, stock: 0 },
      { partNumber: 'XAS-SRV-MOT', name: 'X-Axis Servo Motor', category: 'Electrical', unitCost: 1800, minStock: 1, reorderPoint: 1, stock: 1 },

      // Hydraulic Press Parts
      { partNumber: 'HYD-CYL-500', name: 'Main Hydraulic Cylinder', category: 'Pumps', unitCost: 4500, minStock: 0, reorderPoint: 1, stock: 0 },
      { partNumber: 'HYD-SEAL-KIT', name: 'Hydraulic Seal Kit', category: 'Fasteners', unitCost: 180, minStock: 3, reorderPoint: 5, stock: 8 },
      { partNumber: 'PRESS-VALVE', name: 'Pressure Relief Valve', category: 'Pumps', unitCost: 320, minStock: 2, reorderPoint: 3, stock: 4 },
      { partNumber: 'HYD-RET-FLT', name: 'Hydraulic Return Filter', category: 'Filters', unitCost: 95, minStock: 4, reorderPoint: 6, stock: 10 },

      // General Maintenance Parts
      { partNumber: 'OIL-SYN-10W30', name: 'Synthetic Oil 10W-30 (5L)', category: 'Filters', unitCost: 45, minStock: 10, reorderPoint: 15, stock: 25 },
      { partNumber: 'GREASE-LITH-EP2', name: 'Lithium Grease EP2 (1kg)', category: 'Filters', unitCost: 18, minStock: 20, reorderPoint: 30, stock: 50 },
      { partNumber: 'BOLT-M8-50', name: 'Hex Bolt M8x50mm (Box of 100)', category: 'Fasteners', unitCost: 12, minStock: 5, reorderPoint: 10, stock: 15 },
      { partNumber: 'WASHER-M8', name: 'Flat Washer M8 (Box of 100)', category: 'Fasteners', unitCost: 5, minStock: 10, reorderPoint: 15, stock: 20 },
    ];

    console.log('📦 Creating inventory items...');
    const createdItems = [];

    for (const item of inventoryItems) {
      const itemId = randomUUID();
      const categoryId = categoryMap[item.category];

      await db.sql`
        INSERT OR IGNORE INTO InventoryItem (
          id, organizationId, partNumber, name, categoryId, unitCost, currency,
          minimumStock, reorderPoint, isActive, createdAt, updatedAt, createdById
        ) VALUES (
          ${itemId}, ${organizationId}, ${item.partNumber}, ${item.name}, ${categoryId},
          ${item.unitCost}, 'PHP', ${item.minStock}, ${item.reorderPoint}, 1,
          datetime('now'), datetime('now'), ${userId}
        )
      `;

      createdItems.push({ ...item, itemId });
      console.log(`  ✅ ${item.partNumber} - ${item.name} (₱${item.unitCost})`);
    }
    console.log(`✅ Created ${inventoryItems.length} inventory items\n`);

    // Add stock to locations
    console.log('📊 Adding stock quantities to locations...');
    let totalStock = 0;

    for (const item of createdItems) {
      if (item.stock > 0) {
        // Distribute stock across locations (80% main warehouse, 20% production floor)
        const mainWarehouseQty = Math.ceil(item.stock * 0.8);
        const prodFloorQty = item.stock - mainWarehouseQty;

        // Main Warehouse stock
        const stockId1 = randomUUID();
        await db.sql`
          INSERT OR IGNORE INTO InventoryStock (
            id, itemId, locationId, quantity, reservedQuantity, createdAt, updatedAt
          ) VALUES (
            ${stockId1}, ${item.itemId}, ${locations[0].id}, ${mainWarehouseQty}, 0,
            datetime('now'), datetime('now')
          )
        `;

        // Production Floor stock
        if (prodFloorQty > 0) {
          const stockId2 = randomUUID();
          await db.sql`
            INSERT OR IGNORE INTO InventoryStock (
              id, itemId, locationId, quantity, reservedQuantity, createdAt, updatedAt
            ) VALUES (
              ${stockId2}, ${item.itemId}, ${locations[1].id}, ${prodFloorQty}, 0,
              datetime('now'), datetime('now')
            )
          `;
        }

        console.log(`  📦 ${item.partNumber}: ${mainWarehouseQty} in warehouse, ${prodFloorQty} on floor`);
        totalStock += item.stock;
      }
    }
    console.log(`✅ Added ${totalStock} total units of stock\n`);

    // Summary
    console.log('\n📋 INVENTORY SEED SUMMARY:');
    console.log('═'.repeat(60));
    console.log(`✅ Categories: ${categories.length}`);
    console.log(`✅ Locations: ${locations.length}`);
    console.log(`✅ Items: ${inventoryItems.length}`);
    console.log(`✅ Total Stock Units: ${totalStock}`);
    console.log('═'.repeat(60));

    console.log('\n💡 Test Scenarios:');
    console.log('1. Coolant Pump - 5 in stock (should partially fulfill)');
    console.log('2. Hydraulic Filter - 12 in stock (should fully fulfill)');
    console.log('3. Spindle Bearing - 3 in stock (should partially fulfill)');
    console.log('4. Tool Changer - 0 in stock (should create full PR)');
    console.log('5. Hydraulic Cylinder - 0 in stock (should create full PR)');

    await db.disconnect();
    console.log('\n✅ Inventory seed completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    await db.disconnect();
    process.exit(1);
  }
}

seedInventoryData();
