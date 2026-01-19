const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function fixItemId() {
  try {
    // Get current schema
    const schema = await db.sql('SELECT sql FROM sqlite_master WHERE type="table" AND name="AssetPart";');
    console.log('Current schema:', schema[0].sql);

    // Create temporary table with itemId as nullable
    await db.sql(`
      CREATE TABLE AssetPart_new AS SELECT * FROM AssetPart;
    `);
    console.log('✅ Created temp table');

    await db.sql('DROP TABLE AssetPart;');
    console.log('✅ Dropped old table');

    await db.sql(`
      CREATE TABLE AssetPart (
        id TEXT PRIMARY KEY,
        assetId TEXT NOT NULL,
        itemId TEXT,
        partNumber TEXT,
        partName TEXT,
        sapNumber TEXT,
        description TEXT,
        manufacturer TEXT,
        modelNumber TEXT,
        unitOfMeasure TEXT,
        quantity REAL NOT NULL,
        isPrimary INTEGER DEFAULT 0,
        maintenanceInterval INTEGER,
        lastReplacedDate TEXT,
        nextReplacementDue TEXT,
        notes TEXT,
        createdById TEXT NOT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        componentClassification TEXT,
        pmType TEXT,
        smpNumber INTEGER,
        frequencyPM TEXT,
        maintenanceTimeMinutes INTEGER,
        machineStopRequired TEXT,
        inspectionStandard TEXT,
        frequencyAM TEXT,
        qaMatrixNo INTEGER,
        qmMatrixNo INTEGER,
        kaizenType TEXT,
        kaizenNo TEXT,
        storeroomLocation TEXT,
        vendor TEXT,
        drawingPicture TEXT
      );
    `);
    console.log('✅ Created new table with nullable itemId');

    await db.sql(`INSERT INTO AssetPart SELECT * FROM AssetPart_new;`);
    console.log('✅ Copied data back');

    await db.sql('DROP TABLE AssetPart_new;');
    console.log('✅ Dropped temp table');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixItemId();
