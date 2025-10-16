const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

console.log('Creating tables...');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Philippines',
    "industry" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'starter',
    "status" TEXT NOT NULL DEFAULT 'active',
    "trialEndsAt" DATETIME,
    "subscriptionEndsAt" DATETIME,
    "maxUsers" INTEGER NOT NULL DEFAULT 10,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT,
    "permissions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,
    "roleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
  );

  CREATE TABLE IF NOT EXISTS "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "parentId" TEXT,
    "address" TEXT,
    "city" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "assetNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "purchaseDate" DATETIME,
    "purchaseCost" REAL,
    "warrantyExpiresAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'operational',
    "criticality" TEXT,
    "locationId" TEXT,
    "parentAssetId" TEXT,
    "imageUrl" TEXT,
    "customFields" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "WorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "workOrderNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'corrective',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "assetId" TEXT,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "scheduledStart" DATETIME,
    "scheduledEnd" DATETIME,
    "actualStart" DATETIME,
    "actualEnd" DATETIME,
    "estimatedHours" REAL,
    "actualHours" REAL,
    "laborCost" REAL,
    "partsCost" REAL,
    "totalCost" REAL,
    "notes" TEXT,
    "customFields" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME
  );

  CREATE TABLE IF NOT EXISTS "PMSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "assetId" TEXT,
    "frequency" TEXT NOT NULL,
    "frequencyValue" INTEGER NOT NULL DEFAULT 1,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'active',
    "assignedToId" TEXT,
    "lastCompleted" DATETIME,
    "nextDue" DATETIME,
    "tasks" TEXT,
    "parts" TEXT,
    "estimatedHours" REAL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "ModuleLicense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "moduleCode" TEXT NOT NULL,
    "tierLevel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "activatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "activatedById" TEXT,
    "licenseKey" TEXT,
    "maxUsers" INTEGER,
    "usageLimits" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "ModuleUsageTracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "moduleCode" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "transactions" INTEGER NOT NULL DEFAULT 0,
    "apiCalls" INTEGER NOT NULL DEFAULT 0,
    "storageUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "ModuleAccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleCode" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "ModuleRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "moduleCode" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "justification" TEXT,
    "expectedUsage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  CREATE UNIQUE INDEX IF NOT EXISTS "Asset_organizationId_assetNumber_key" ON "Asset"("organizationId", "assetNumber");
  CREATE UNIQUE INDEX IF NOT EXISTS "WorkOrder_organizationId_workOrderNumber_key" ON "WorkOrder"("organizationId", "workOrderNumber");
  CREATE UNIQUE INDEX IF NOT EXISTS "ModuleLicense_organizationId_moduleCode_key" ON "ModuleLicense"("organizationId", "moduleCode");
`);

console.log('✅ Database initialized successfully!');
db.close();
