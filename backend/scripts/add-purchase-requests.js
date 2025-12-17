const { Database } = require('@sqlitecloud/drivers');
const BetterSqlite3 = require('better-sqlite3');
require('dotenv').config();

async function migrate() {
  const connectionString = process.env.DATABASE_URL || 'file:./dev.db';
  console.log('🔌 Connecting to database:', connectionString.replace(/apikey=[^&]+/, 'apikey=***'));

  let db;
  let isLocalFile = false;

  try {
    // Check if it's a local file or cloud connection
    if (connectionString.startsWith('file:')) {
      isLocalFile = true;
      const filePath = connectionString.replace('file:', '');
      db = new BetterSqlite3(filePath);
      console.log('✅ Connected to local SQLite database');
    } else {
      isLocalFile = false;
      db = new Database(connectionString);
      console.log('✅ Connected to SQLite Cloud database');
    }

    console.log('📝 Creating PurchaseRequest table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "PurchaseRequest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "organizationId" TEXT NOT NULL,
        "requestNumber" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "priority" TEXT NOT NULL DEFAULT 'medium',
        "status" TEXT NOT NULL DEFAULT 'pending',
        "type" TEXT NOT NULL DEFAULT 'parts',
        "pmScheduleId" TEXT,
        "workOrderId" TEXT,
        "assetId" TEXT,
        "items" TEXT NOT NULL,
        "estimatedCost" REAL,
        "actualCost" REAL,
        "requestedById" TEXT NOT NULL,
        "approvedById" TEXT,
        "approvedAt" DATETIME,
        "rejectedById" TEXT,
        "rejectedAt" DATETIME,
        "rejectionReason" TEXT,
        "purchasedAt" DATETIME,
        "notes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
        FOREIGN KEY ("pmScheduleId") REFERENCES "PMSchedule"("id") ON DELETE SET NULL,
        FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL,
        FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL,
        FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE,
        FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL,
        FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseRequest_organizationId_requestNumber_key"
        ON "PurchaseRequest"("organizationId", "requestNumber");

      CREATE INDEX IF NOT EXISTS "PurchaseRequest_organizationId_idx" ON "PurchaseRequest"("organizationId");
      CREATE INDEX IF NOT EXISTS "PurchaseRequest_status_idx" ON "PurchaseRequest"("status");
      CREATE INDEX IF NOT EXISTS "PurchaseRequest_pmScheduleId_idx" ON "PurchaseRequest"("pmScheduleId");
      CREATE INDEX IF NOT EXISTS "PurchaseRequest_workOrderId_idx" ON "PurchaseRequest"("workOrderId");
      CREATE INDEX IF NOT EXISTS "PurchaseRequest_requestedById_idx" ON "PurchaseRequest"("requestedById");
    `;

    if (isLocalFile) {
      db.exec(createTableSQL);
    } else {
      await db.sql(createTableSQL);
    }

    console.log('✅ PurchaseRequest table created successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (db) {
      if (isLocalFile) {
        db.close();
      } else {
        await db.close();
      }
    }
  }
}

migrate().catch(console.error);
