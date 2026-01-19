const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function addWCMColumns() {
  const columns = [
    'ALTER TABLE AssetPart ADD COLUMN sapNumber TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN componentClassification TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN pmType TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN smpNumber INTEGER;',
    'ALTER TABLE AssetPart ADD COLUMN frequencyPM TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN maintenanceTimeMinutes INTEGER;',
    'ALTER TABLE AssetPart ADD COLUMN machineStopRequired TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN inspectionStandard TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN frequencyAM TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN qaMatrixNo INTEGER;',
    'ALTER TABLE AssetPart ADD COLUMN qmMatrixNo INTEGER;',
    'ALTER TABLE AssetPart ADD COLUMN kaizenType TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN kaizenNo TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN storeroomLocation TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN vendor TEXT;',
    'ALTER TABLE AssetPart ADD COLUMN drawingPicture TEXT;',
  ];

  try {
    for (const sql of columns) {
      try {
        await db.sql(sql);
        console.log(`✅ Added column: ${sql.match(/ADD COLUMN (\w+)/)[1]}`);
      } catch (error) {
        if (error.message.includes('duplicate column')) {
          console.log(`⏭️  Column already exists: ${sql.match(/ADD COLUMN (\w+)/)[1]}`);
        } else {
          throw error;
        }
      }
    }
    console.log('✅ All WCM columns added to AssetPart');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addWCMColumns();
