/**
 * Migration Script: Convert JSON maintenanceParts to AssetPart relational records
 *
 * This script:
 * 1. Reads all assets with maintenanceParts JSON data
 * 2. For each part, creates or finds matching InventoryItem
 * 3. Creates AssetPart junction records
 * 4. Optionally clears the old JSON field
 */

const Database = require('better-sqlite3');
const path = require('path');
const { randomBytes } = require('crypto');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

console.log('🔄 Starting migration: JSON maintenanceParts → AssetPart table');
console.log('================================================\n');

// Get user ID for createdById (use first user or create system user)
const users = db.prepare('SELECT id FROM User LIMIT 1').all();
const systemUserId = users.length > 0 ? users[0].id : createSystemUser();

function createSystemUser() {
  const id = randomBytes(16).toString('hex');
  db.prepare(`
    INSERT INTO User (id, email, password, firstName, lastName, status, isSuperAdmin, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(id, 'system@cmms.local', 'n/a', 'System', 'Migration', 'active', 0);
  console.log('✅ Created system user for migration');
  return id;
}

// Get default stock location or create one
const locations = db.prepare('SELECT id FROM StockLocation LIMIT 1').all();
const defaultLocationId = locations.length > 0 ? locations[0].id : createDefaultLocation();

function createDefaultLocation() {
  const id = randomBytes(16).toString('hex');
  const orgs = db.prepare('SELECT id FROM Organization LIMIT 1').all();

  if (orgs.length === 0) {
    console.log('⚠️  No organizations found, skipping stock location creation');
    return null;
  }

  const orgId = orgs[0].id;

  db.prepare(`
    INSERT INTO StockLocation (id, organizationId, name, isDefault, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(id, orgId, 'Main Warehouse', 1, 1);
  console.log('✅ Created default stock location');
  return id;
}

// Statistics
const stats = {
  assetsProcessed: 0,
  partsFound: 0,
  inventoryItemsCreated: 0,
  inventoryItemsReused: 0,
  assetPartsCreated: 0,
  assetPartsSkipped: 0,
  errors: [],
};

// Check if we have necessary data to proceed
if (!defaultLocationId) {
  console.log('❌ Cannot proceed without a stock location. Please create organizations and stock locations first.');
  db.close();
  process.exit(1);
}

// Get all assets with maintenanceParts
const assets = db.prepare(`
  SELECT id, assetNumber, name, organizationId, maintenanceParts, createdById
  FROM Asset
  WHERE maintenanceParts IS NOT NULL AND maintenanceParts != ''
`).all();

console.log(`📦 Found ${assets.length} asset(s) with maintenance parts\n`);

// Process each asset
for (const asset of assets) {
  console.log(`\n🔧 Processing: ${asset.assetNumber} - ${asset.name}`);
  stats.assetsProcessed++;

  let parts;
  try {
    parts = JSON.parse(asset.maintenanceParts);
    if (!Array.isArray(parts)) {
      console.log(`   ⚠️  Invalid format (not an array), skipping`);
      stats.errors.push({ assetId: asset.id, error: 'Invalid JSON format' });
      continue;
    }
  } catch (e) {
    console.log(`   ⚠️  Failed to parse JSON: ${e.message}`);
    stats.errors.push({ assetId: asset.id, error: `Parse error: ${e.message}` });
    continue;
  }

  console.log(`   Found ${parts.length} part(s) in JSON`);
  stats.partsFound += parts.length;

  for (const part of parts) {
    if (!part.name || !part.name.trim()) {
      console.log(`   ⚠️  Skipping part with no name`);
      continue;
    }

    try {
      // Generate part number from name if not exists
      const partNumber = generatePartNumber(part.name);
      const partName = part.name.trim();
      const quantity = parseFloat(part.quantity) || 1;
      const estimatedCost = parseFloat(part.estimatedCost) || 0;

      // Check if inventory item exists by part number or exact name match
      let inventoryItem = db.prepare(`
        SELECT id FROM InventoryItem
        WHERE organizationId = ? AND (partNumber = ? OR name = ?)
        LIMIT 1
      `).get(asset.organizationId, partNumber, partName);

      if (!inventoryItem) {
        // Create new inventory item
        const itemId = randomBytes(16).toString('hex');
        db.prepare(`
          INSERT INTO InventoryItem (
            id, organizationId, partNumber, name, description,
            unitOfMeasure, unitCost, currency, minimumStock, isActive,
            createdById, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run(
          itemId,
          asset.organizationId,
          partNumber,
          partName,
          `Migrated from asset ${asset.assetNumber}`,
          'piece',
          estimatedCost,
          'PHP',
          quantity, // Set minimum stock to the quantity needed
          1,
          systemUserId
        );

        // Create initial stock record
        const stockId = randomBytes(16).toString('hex');
        db.prepare(`
          INSERT INTO InventoryStock (id, itemId, locationId, quantity, reservedQuantity, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).run(stockId, itemId, defaultLocationId, 0, 0);

        inventoryItem = { id: itemId };
        stats.inventoryItemsCreated++;
        console.log(`   ✅ Created inventory item: ${partName} (${partNumber})`);
      } else {
        stats.inventoryItemsReused++;
        console.log(`   ♻️  Reusing existing inventory item: ${partName}`);
      }

      // Check if AssetPart already exists
      const existingAssetPart = db.prepare(`
        SELECT id FROM AssetPart WHERE assetId = ? AND itemId = ?
      `).get(asset.id, inventoryItem.id);

      if (existingAssetPart) {
        console.log(`   ⏭️  AssetPart already exists, skipping`);
        stats.assetPartsSkipped++;
      } else {
        // Create AssetPart junction record
        const assetPartId = randomBytes(16).toString('hex');
        db.prepare(`
          INSERT INTO AssetPart (
            id, assetId, itemId, quantity, isPrimary, notes,
            createdById, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run(
          assetPartId,
          asset.id,
          inventoryItem.id,
          quantity,
          0, // Not marked as primary by default
          'Migrated from JSON maintenance parts',
          asset.createdById || systemUserId
        );

        stats.assetPartsCreated++;
        console.log(`   ✅ Created AssetPart link (qty: ${quantity})`);
      }
    } catch (error) {
      console.log(`   ❌ Error processing part "${part.name}": ${error.message}`);
      stats.errors.push({
        assetId: asset.id,
        partName: part.name,
        error: error.message,
      });
    }
  }
}

// Generate part number from name
function generatePartNumber(name) {
  // Convert to uppercase, remove special chars, take first 20 chars
  const sanitized = name.toUpperCase()
    .replace(/[^A-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20);

  // Add random suffix to ensure uniqueness
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `PART-${sanitized}-${suffix}`;
}

// Print statistics
console.log('\n\n================================================');
console.log('📊 Migration Summary');
console.log('================================================');
console.log(`Assets processed:          ${stats.assetsProcessed}`);
console.log(`Parts found in JSON:       ${stats.partsFound}`);
console.log(`Inventory items created:   ${stats.inventoryItemsCreated}`);
console.log(`Inventory items reused:    ${stats.inventoryItemsReused}`);
console.log(`AssetPart links created:   ${stats.assetPartsCreated}`);
console.log(`AssetPart links skipped:   ${stats.assetPartsSkipped}`);
console.log(`Errors encountered:        ${stats.errors.length}`);

if (stats.errors.length > 0) {
  console.log('\n⚠️  Errors:');
  stats.errors.forEach((err, idx) => {
    console.log(`${idx + 1}. Asset ${err.assetId} - ${err.partName || 'unknown'}: ${err.error}`);
  });
}

console.log('\n================================================');

// Ask if user wants to clear the old JSON field
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\n❓ Clear old JSON maintenanceParts field from assets? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    db.prepare(`UPDATE Asset SET maintenanceParts = NULL WHERE maintenanceParts IS NOT NULL`).run();
    console.log('✅ Cleared maintenanceParts JSON field from all assets');
  } else {
    console.log('ℹ️  Keeping old JSON field for reference (can be manually removed later)');
  }

  console.log('\n✅ Migration complete!');
  rl.close();
  db.close();
});
