-- CreateTable
CREATE TABLE "ModuleRequest" (
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ModuleRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModuleRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModuleRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ModuleRequest_organizationId_idx" ON "ModuleRequest"("organizationId");

-- CreateIndex
CREATE INDEX "ModuleRequest_requestedById_idx" ON "ModuleRequest"("requestedById");

-- CreateIndex
CREATE INDEX "ModuleRequest_status_idx" ON "ModuleRequest"("status");
