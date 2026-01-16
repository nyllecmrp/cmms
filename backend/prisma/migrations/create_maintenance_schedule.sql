-- CreateTable: MaintenanceSchedule
CREATE TABLE IF NOT EXISTS "MaintenanceSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "assetPartId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "partNumber" TEXT,
    "partName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "completedAt" DATETIME,
    "completedById" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaintenanceSchedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceSchedule_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceSchedule_assetPartId_fkey" FOREIGN KEY ("assetPartId") REFERENCES "AssetPart" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceSchedule_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "MaintenanceSchedule_organizationId_idx" ON "MaintenanceSchedule"("organizationId");
CREATE INDEX "MaintenanceSchedule_assetId_idx" ON "MaintenanceSchedule"("assetId");
CREATE INDEX "MaintenanceSchedule_year_idx" ON "MaintenanceSchedule"("year");
CREATE INDEX "MaintenanceSchedule_status_idx" ON "MaintenanceSchedule"("status");
CREATE UNIQUE INDEX "MaintenanceSchedule_assetPartId_year_weekNumber_maintenanceType_key" ON "MaintenanceSchedule"("assetPartId", "year", "weekNumber", "maintenanceType");
