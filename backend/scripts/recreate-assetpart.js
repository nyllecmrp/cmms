const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function recreateTable() {
  try {
    await db.sql('DROP TABLE IF EXISTS AssetPart;');
    console.log('✅ Dropped AssetPart');

    await db.sql(`
      CREATE TABLE AssetPart (
        id TEXT PRIMARY KEY,
        assetId TEXT NOT NULL,
        itemId TEXT,
        quantity REAL NOT NULL DEFAULT 1,
        isPrimary INTEGER DEFAULT 0,
        maintenanceInterval INTEGER,
        lastReplacedDate DATETIME,
        nextReplacementDue DATETIME,
        notes TEXT,
        createdById TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        criticalityLevel TEXT DEFAULT 'C',
        leadTimeDays INTEGER,
        minimumStock REAL,
        preferredSupplierId TEXT,
        alternatePartNumber TEXT,
        expectedLifeHours REAL,
        expectedLifeCycles INTEGER,
        lastInspectionDate DATETIME,
        nextInspectionDue DATETIME,
        standardReplacement INTEGER DEFAULT 0,
        partNumber TEXT,
        partName TEXT,
        description TEXT,
        manufacturer TEXT,
        modelNumber TEXT,
        unitOfMeasure TEXT DEFAULT 'EA',
        sapNumber TEXT,
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
    console.log('✅ Created new AssetPart table');

    // Copy data from backup
    const columns = 'id, assetId, itemId, quantity, isPrimary, maintenanceInterval, lastReplacedDate, nextReplacementDue, notes, createdById, createdAt, updatedAt, criticalityLevel, leadTimeDays, minimumStock, preferredSupplierId, alternatePartNumber, expectedLifeHours, expectedLifeCycles, lastInspectionDate, nextInspectionDue, standardReplacement, partNumber, partName, description, manufacturer, modelNumber, unitOfMeasure, sapNumber, componentClassification, pmType, smpNumber, frequencyPM, maintenanceTimeMinutes, machineStopRequired, inspectionStandard, frequencyAM, qaMatrixNo, qmMatrixNo, kaizenType, kaizenNo, storeroomLocation, vendor, drawingPicture';

    await db.sql(`INSERT INTO AssetPart (${columns}) SELECT ${columns} FROM AssetPart_new;`);
    console.log('✅ Copied data from backup');

    await db.sql('DROP TABLE AssetPart_new;');
    console.log('✅ Deleted backup table');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

recreateTable();
