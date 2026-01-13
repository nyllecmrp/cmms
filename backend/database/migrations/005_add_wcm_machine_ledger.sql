-- Migration: Add WCM (World Class Manufacturing) Machine Ledger Features
-- Date: 2026-01-12
-- Description: Complete machine ledger with technical specs, lubrication, OEE, and autonomous maintenance

-- =====================================================
-- 1. TECHNICAL SPECIFICATIONS (Asset Enhancement)
-- =====================================================

-- Add technical specification fields to Asset table
ALTER TABLE Asset ADD COLUMN technicalSpecs TEXT; -- JSON: {ratedSpeed, capacity, powerRating, voltage, dimensions, weight, etc.}
ALTER TABLE Asset ADD COLUMN operatingParameters TEXT; -- JSON: {minTemp, maxTemp, pressure, flow, etc.}
ALTER TABLE Asset ADD COLUMN safetyRequirements TEXT; -- Safety procedures and PPE requirements
ALTER TABLE Asset ADD COLUMN installationDate DATETIME; -- When machine was installed
ALTER TABLE Asset ADD COLUMN commissioningDate DATETIME; -- When machine started operation
ALTER TABLE Asset ADD COLUMN expectedLifeYears INTEGER; -- Design life expectancy
ALTER TABLE Asset ADD COLUMN depreciationMethod TEXT; -- Straight-line, declining, etc.
ALTER TABLE Asset ADD COLUMN bookValue REAL; -- Current book value
ALTER TABLE Asset ADD COLUMN replacementCost REAL; -- Estimated replacement cost
ALTER TABLE Asset ADD COLUMN oeeTarget REAL; -- Target OEE percentage (e.g., 85.0)

-- =====================================================
-- 2. LUBRICATION SCHEDULE
-- =====================================================

CREATE TABLE IF NOT EXISTS LubricationPoint (
    id TEXT PRIMARY KEY,
    assetId TEXT NOT NULL,
    pointNumber TEXT NOT NULL, -- L1, L2, L3, etc.
    pointName TEXT NOT NULL, -- "Main Bearing", "Gearbox", etc.
    description TEXT,
    location TEXT, -- Location on machine
    lubricantType TEXT NOT NULL, -- Oil grade, grease type
    lubricantSpec TEXT, -- SAE 40, NLGI 2, etc.
    quantity REAL, -- Amount in liters/grams
    quantityUnit TEXT DEFAULT 'ml', -- ml, L, g, kg
    method TEXT, -- Manual, auto-lube, grease gun, oil can
    frequency TEXT NOT NULL, -- daily, weekly, monthly, quarterly, etc.
    frequencyDays INTEGER, -- Numeric days for calculation
    lastServiced DATETIME,
    nextDue DATETIME,
    assignedToId TEXT, -- Responsible person/role
    status TEXT DEFAULT 'active', -- active, inactive
    imageUrl TEXT, -- Photo of lubrication point
    notes TEXT,
    createdById TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedToId) REFERENCES User(id) ON DELETE SET NULL,
    FOREIGN KEY (createdById) REFERENCES User(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_lubrication_point_asset ON LubricationPoint(assetId);
CREATE INDEX IF NOT EXISTS idx_lubrication_point_next_due ON LubricationPoint(nextDue);
CREATE INDEX IF NOT EXISTS idx_lubrication_point_status ON LubricationPoint(status);

-- Lubrication service records
CREATE TABLE IF NOT EXISTS LubricationRecord (
    id TEXT PRIMARY KEY,
    lubricationPointId TEXT NOT NULL,
    assetId TEXT NOT NULL,
    servicedAt DATETIME NOT NULL,
    servicedById TEXT NOT NULL,
    lubricantUsed TEXT, -- What was actually used
    quantityUsed REAL,
    conditionBefore TEXT, -- Clean, dirty, contaminated, low, etc.
    conditionAfter TEXT,
    observations TEXT, -- Any issues noted
    nextDueDate DATETIME,
    photoUrl TEXT,
    workOrderId TEXT, -- Link to work order if part of PM
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lubricationPointId) REFERENCES LubricationPoint(id) ON DELETE CASCADE,
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE CASCADE,
    FOREIGN KEY (servicedById) REFERENCES User(id) ON DELETE RESTRICT,
    FOREIGN KEY (workOrderId) REFERENCES WorkOrder(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_lubrication_record_point ON LubricationRecord(lubricationPointId);
CREATE INDEX IF NOT EXISTS idx_lubrication_record_asset ON LubricationRecord(assetId);
CREATE INDEX IF NOT EXISTS idx_lubrication_record_date ON LubricationRecord(servicedAt DESC);

-- =====================================================
-- 3. SPARE PARTS CRITICALITY (Enhancement)
-- =====================================================

-- Add WCM-specific fields to AssetPart
ALTER TABLE AssetPart ADD COLUMN criticalityLevel TEXT DEFAULT 'C'; -- A (critical), B (important), C (standard)
ALTER TABLE AssetPart ADD COLUMN leadTimeDays INTEGER; -- Procurement lead time
ALTER TABLE AssetPart ADD COLUMN minimumStock REAL; -- Min stock level for this asset
ALTER TABLE AssetPart ADD COLUMN preferredSupplierId TEXT; -- Preferred supplier
ALTER TABLE AssetPart ADD COLUMN alternatePartNumber TEXT; -- Alternative/substitute part
ALTER TABLE AssetPart ADD COLUMN expectedLifeHours REAL; -- Expected part life in hours
ALTER TABLE AssetPart ADD COLUMN expectedLifeCycles INTEGER; -- Or in cycles
ALTER TABLE AssetPart ADD COLUMN lastInspectionDate DATETIME;
ALTER TABLE AssetPart ADD COLUMN nextInspectionDue DATETIME;
ALTER TABLE AssetPart ADD COLUMN standardReplacement INTEGER DEFAULT 0; -- 1 if replaced during standard PM

-- =====================================================
-- 4. OEE (Overall Equipment Effectiveness) TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS OEERecord (
    id TEXT PRIMARY KEY,
    assetId TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    recordDate DATE NOT NULL,
    shiftId TEXT, -- Morning, afternoon, night shift
    -- Availability metrics
    plannedProductionTime REAL NOT NULL, -- Minutes
    unplannedDowntime REAL DEFAULT 0, -- Minutes (breakdowns)
    plannedDowntime REAL DEFAULT 0, -- Minutes (setup, changeover)
    operatingTime REAL, -- GENERATED: plannedProductionTime - unplannedDowntime - plannedDowntime
    availabilityPercent REAL, -- GENERATED: (operatingTime / plannedProductionTime) * 100
    -- Performance metrics
    idealCycleTime REAL, -- Seconds per unit
    totalUnitsProduced INTEGER DEFAULT 0,
    actualRuntime REAL, -- Minutes actually running
    performancePercent REAL, -- GENERATED: (idealCycleTime * totalUnits) / (actualRuntime * 60) * 100
    -- Quality metrics
    goodUnits INTEGER DEFAULT 0,
    defectiveUnits INTEGER DEFAULT 0,
    qualityPercent REAL, -- GENERATED: (goodUnits / totalUnits) * 100
    -- Overall OEE
    oeePercent REAL, -- GENERATED: availability * performance * quality / 10000
    -- Loss categorization (Six Big Losses)
    breakdownLoss REAL DEFAULT 0, -- Minutes
    setupChangeLoss REAL DEFAULT 0, -- Minutes
    smallStopLoss REAL DEFAULT 0, -- Minutes
    speedLoss REAL DEFAULT 0, -- Minutes (running below ideal)
    startupLoss REAL DEFAULT 0, -- Defects during startup
    qualityDefectLoss REAL DEFAULT 0, -- Defects during production
    -- Notes and actions
    notes TEXT,
    improvements TEXT, -- Actions taken to improve
    recordedById TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE CASCADE,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
    FOREIGN KEY (recordedById) REFERENCES User(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_oee_record_asset ON OEERecord(assetId);
CREATE INDEX IF NOT EXISTS idx_oee_record_date ON OEERecord(recordDate DESC);
CREATE INDEX IF NOT EXISTS idx_oee_record_org ON OEERecord(organizationId);
CREATE UNIQUE INDEX IF NOT EXISTS idx_oee_record_unique ON OEERecord(assetId, recordDate, shiftId);

-- =====================================================
-- 5. AUTONOMOUS MAINTENANCE (AM) CHECKLISTS
-- =====================================================

-- AM Checklist Templates
CREATE TABLE IF NOT EXISTS AMChecklistTemplate (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    assetId TEXT, -- NULL = template for asset category
    assetCategory TEXT, -- If template applies to category
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL, -- daily, weekly, monthly
    estimatedMinutes INTEGER, -- Time to complete
    requiredSkillLevel TEXT, -- operator, technician, specialist
    isActive INTEGER DEFAULT 1,
    displayOrder INTEGER DEFAULT 0,
    createdById TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE CASCADE,
    FOREIGN KEY (createdById) REFERENCES User(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_am_template_org ON AMChecklistTemplate(organizationId);
CREATE INDEX IF NOT EXISTS idx_am_template_asset ON AMChecklistTemplate(assetId);

-- AM Checklist Items (tasks within a checklist)
CREATE TABLE IF NOT EXISTS AMChecklistItem (
    id TEXT PRIMARY KEY,
    templateId TEXT NOT NULL,
    itemNumber INTEGER NOT NULL,
    description TEXT NOT NULL,
    checkType TEXT DEFAULT 'visual', -- visual, measure, clean, lubricate, adjust, other
    acceptanceCriteria TEXT, -- What is acceptable
    photoRequired INTEGER DEFAULT 0,
    measurementRequired INTEGER DEFAULT 0,
    measurementUnit TEXT, -- mm, C, bar, etc.
    minValue REAL,
    maxValue REAL,
    safetyNote TEXT,
    displayOrder INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (templateId) REFERENCES AMChecklistTemplate(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_am_item_template ON AMChecklistItem(templateId);

-- AM Checklist Executions (actual completed checklists)
CREATE TABLE IF NOT EXISTS AMChecklistExecution (
    id TEXT PRIMARY KEY,
    templateId TEXT NOT NULL,
    assetId TEXT NOT NULL,
    executedAt DATETIME NOT NULL,
    executedById TEXT NOT NULL,
    durationMinutes INTEGER,
    overallStatus TEXT DEFAULT 'pass', -- pass, fail, needs_attention
    abnormalitiesFound INTEGER DEFAULT 0,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (templateId) REFERENCES AMChecklistTemplate(id) ON DELETE RESTRICT,
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE CASCADE,
    FOREIGN KEY (executedById) REFERENCES User(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_am_execution_template ON AMChecklistExecution(templateId);
CREATE INDEX IF NOT EXISTS idx_am_execution_asset ON AMChecklistExecution(assetId);
CREATE INDEX IF NOT EXISTS idx_am_execution_date ON AMChecklistExecution(executedAt DESC);

-- AM Checklist Item Results
CREATE TABLE IF NOT EXISTS AMChecklistResult (
    id TEXT PRIMARY KEY,
    executionId TEXT NOT NULL,
    checklistItemId TEXT NOT NULL,
    status TEXT NOT NULL, -- ok, ng (not good), na (not applicable)
    measurementValue REAL,
    observation TEXT,
    photoUrl TEXT,
    actionRequired INTEGER DEFAULT 0,
    actionTaken TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (executionId) REFERENCES AMChecklistExecution(id) ON DELETE CASCADE,
    FOREIGN KEY (checklistItemId) REFERENCES AMChecklistItem(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_am_result_execution ON AMChecklistResult(executionId);

-- =====================================================
-- 6. MACHINE DOCUMENTS & SOPs
-- =====================================================

CREATE TABLE IF NOT EXISTS MachineDocument (
    id TEXT PRIMARY KEY,
    assetId TEXT NOT NULL,
    documentType TEXT NOT NULL, -- sop, manual, drawing, safety, certificate, other
    title TEXT NOT NULL,
    description TEXT,
    fileName TEXT,
    fileUrl TEXT,
    fileSize INTEGER, -- bytes
    version TEXT DEFAULT '1.0',
    language TEXT DEFAULT 'en',
    uploadedById TEXT NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME, -- For certifications, calibrations
    isActive INTEGER DEFAULT 1,
    tags TEXT, -- JSON array for searching
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE CASCADE,
    FOREIGN KEY (uploadedById) REFERENCES User(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_machine_doc_asset ON MachineDocument(assetId);
CREATE INDEX IF NOT EXISTS idx_machine_doc_type ON MachineDocument(documentType);
CREATE INDEX IF NOT EXISTS idx_machine_doc_expires ON MachineDocument(expiresAt);

-- =====================================================
-- 7. DOWNTIME EVENTS (for detailed tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS DowntimeEvent (
    id TEXT PRIMARY KEY,
    assetId TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME,
    durationMinutes REAL, -- GENERATED or calculated
    downtimeCategory TEXT NOT NULL, -- breakdown, changeover, material_shortage, planned_maintenance, etc.
    downtimeReason TEXT, -- Specific reason
    lossCategory TEXT, -- Maps to Six Big Losses
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    reportedById TEXT NOT NULL,
    assignedToId TEXT,
    workOrderId TEXT, -- Link to WO if created
    resolved INTEGER DEFAULT 0,
    rootCause TEXT, -- 5-Why analysis result
    correctiveAction TEXT,
    preventiveAction TEXT,
    estimatedLossUnits INTEGER, -- Production units lost
    estimatedLossCost REAL, -- Financial impact
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE CASCADE,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
    FOREIGN KEY (reportedById) REFERENCES User(id) ON DELETE RESTRICT,
    FOREIGN KEY (assignedToId) REFERENCES User(id) ON DELETE SET NULL,
    FOREIGN KEY (workOrderId) REFERENCES WorkOrder(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_downtime_asset ON DowntimeEvent(assetId);
CREATE INDEX IF NOT EXISTS idx_downtime_start ON DowntimeEvent(startTime DESC);
CREATE INDEX IF NOT EXISTS idx_downtime_category ON DowntimeEvent(downtimeCategory);
CREATE INDEX IF NOT EXISTS idx_downtime_resolved ON DowntimeEvent(resolved);

-- =====================================================
-- 8. IMPROVEMENT TRACKING (Kaizen)
-- =====================================================

CREATE TABLE IF NOT EXISTS ImprovementAction (
    id TEXT PRIMARY KEY,
    assetId TEXT,
    organizationId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- cost_reduction, quality, safety, productivity, 5s, other
    currentState TEXT,
    targetState TEXT,
    expectedBenefit TEXT,
    priority TEXT DEFAULT 'medium', -- low, medium, high
    status TEXT DEFAULT 'proposed', -- proposed, approved, in_progress, completed, cancelled
    proposedById TEXT NOT NULL,
    proposedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    approvedById TEXT,
    approvedAt DATETIME,
    implementedAt DATETIME,
    targetCompletionDate DATETIME,
    actualCostSavings REAL,
    estimatedCostSavings REAL,
    photos TEXT, -- JSON array of photo URLs
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE SET NULL,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
    FOREIGN KEY (proposedById) REFERENCES User(id) ON DELETE RESTRICT,
    FOREIGN KEY (approvedById) REFERENCES User(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_improvement_asset ON ImprovementAction(assetId);
CREATE INDEX IF NOT EXISTS idx_improvement_org ON ImprovementAction(organizationId);
CREATE INDEX IF NOT EXISTS idx_improvement_status ON ImprovementAction(status);
CREATE INDEX IF NOT EXISTS idx_improvement_proposed ON ImprovementAction(proposedAt DESC);
