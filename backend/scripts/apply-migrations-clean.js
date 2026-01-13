const Database = require('@sqlitecloud/drivers').Database;
const fs = require('fs');
const path = require('path');

async function applyMigrations() {
  const db = new Database(process.env.DATABASE_URL);

  try {
    console.log('🔌 Connecting to database...\n');

    // Migration 006 - Clean SQL only
    console.log('📄 Applying migration 006: Enhance AssetPart for BOM');
    const migration006 = [
      `ALTER TABLE AssetPart ADD COLUMN partNumber TEXT`,
      `ALTER TABLE AssetPart ADD COLUMN partName TEXT`,
      `ALTER TABLE AssetPart ADD COLUMN description TEXT`,
      `ALTER TABLE AssetPart ADD COLUMN manufacturer TEXT`,
      `ALTER TABLE AssetPart ADD COLUMN modelNumber TEXT`,
      `ALTER TABLE AssetPart ADD COLUMN unitOfMeasure TEXT`,
      `ALTER TABLE AssetPart ADD COLUMN isPrimary INTEGER DEFAULT 0`,
      `CREATE INDEX IF NOT EXISTS idx_assetpart_partnumber ON AssetPart(partNumber)`,
      `CREATE INDEX IF NOT EXISTS idx_assetpart_primary ON AssetPart(isPrimary)`
    ];

    for (const sql of migration006) {
      try {
        await db.sql(sql);
      } catch (err) {
        if (!err.message.includes('duplicate column')) {
          console.log(`  ⚠️  ${sql.substring(0, 50)}... - ${err.message}`);
        }
      }
    }
    console.log('✅ Migration 006 applied\n');

    // Migration 007 - SAP Number
    console.log('📄 Applying migration 007: Add SAP Number');
    const migration007 = [
      `ALTER TABLE AssetPart ADD COLUMN sapNumber TEXT`,
      `CREATE INDEX IF NOT EXISTS idx_assetpart_sap ON AssetPart(sapNumber)`
    ];

    for (const sql of migration007) {
      try {
        await db.sql(sql);
      } catch (err) {
        if (!err.message.includes('duplicate column')) {
          console.log(`  ⚠️  ${sql.substring(0, 50)}... - ${err.message}`);
        }
      }
    }
    console.log('✅ Migration 007 applied\n');

    // Migration 009 - Maintenance fields
    console.log('📄 Applying migration 009: Add maintenance fields to AssetPart');
    const migration009 = [
      `ALTER TABLE AssetPart ADD COLUMN componentClassification TEXT`,
      `ALTER TABLE AssetPart ADD COLUMN maintenanceTimeMinutes INTEGER`,
      `CREATE INDEX IF NOT EXISTS idx_assetpart_component ON AssetPart(componentClassification)`
    ];

    for (const sql of migration009) {
      try {
        await db.sql(sql);
      } catch (err) {
        if (!err.message.includes('duplicate column')) {
          console.log(`  ⚠️  ${sql.substring(0, 50)}... - ${err.message}`);
        }
      }
    }
    console.log('✅ Migration 009 applied\n');

    console.log('✅ All migrations completed!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    db.close();
    console.log('✅ Done');
  }
}

applyMigrations().catch(console.error);
