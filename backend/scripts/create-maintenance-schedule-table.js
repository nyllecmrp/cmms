const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function createTable() {
  const sql = `CREATE TABLE IF NOT EXISTS MaintenanceSchedule (
    id TEXT NOT NULL PRIMARY KEY,
    organizationId TEXT NOT NULL,
    assetId TEXT NOT NULL,
    assetPartId TEXT NOT NULL,
    year INTEGER NOT NULL,
    weekNumber INTEGER NOT NULL,
    maintenanceType TEXT NOT NULL,
    partNumber TEXT,
    partName TEXT,
    status TEXT NOT NULL DEFAULT 'planned',
    completedAt DATETIME,
    completedById TEXT,
    notes TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`;

  try {
    await db.sql(sql);
    console.log('✅ MaintenanceSchedule table created');

    await db.sql('CREATE INDEX IF NOT EXISTS MaintenanceSchedule_organizationId_idx ON MaintenanceSchedule(organizationId);');
    await db.sql('CREATE INDEX IF NOT EXISTS MaintenanceSchedule_assetId_idx ON MaintenanceSchedule(assetId);');
    await db.sql('CREATE INDEX IF NOT EXISTS MaintenanceSchedule_year_idx ON MaintenanceSchedule(year);');
    await db.sql('CREATE INDEX IF NOT EXISTS MaintenanceSchedule_status_idx ON MaintenanceSchedule(status);');
    console.log('✅ All indexes created');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTable();
