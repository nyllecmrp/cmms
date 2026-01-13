-- Migration 011: Create Maintenance Schedule and Breakdown Tracking tables

-- Maintenance Schedule (52-week planning)
CREATE TABLE IF NOT EXISTS MaintenanceSchedule (
    id TEXT PRIMARY KEY,
    assetPartId TEXT NOT NULL,
    assetId TEXT NOT NULL,
    weekNumber INTEGER NOT NULL CHECK(weekNumber >= 1 AND weekNumber <= 52),
    year INTEGER NOT NULL,
    maintenanceType TEXT NOT NULL CHECK(maintenanceType IN ('PM', 'AM', 'QM', 'GM')),
    status TEXT NOT NULL CHECK(status IN ('planned', 'completed', 'skipped', 'overdue')) DEFAULT 'planned',
    scheduledDate TEXT,
    completedDate TEXT,
    durationMinutes INTEGER,
    performedBy TEXT,
    notes TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (assetPartId) REFERENCES AssetPart(id) ON DELETE CASCADE,
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE CASCADE,
    UNIQUE(assetPartId, weekNumber, year, maintenanceType)
);

-- Breakdown Tracking
CREATE TABLE IF NOT EXISTS BreakdownEvent (
    id TEXT PRIMARY KEY,
    assetId TEXT NOT NULL,
    assetPartId TEXT,
    breakdownDate TEXT NOT NULL,
    downtimeMinutes INTEGER NOT NULL DEFAULT 0,
    rootCause TEXT CHECK(rootCause IN (
        'external_factors',
        'insufficient_skills',
        'design_weakness',
        'lack_of_pm',
        'lack_of_operating_conditions',
        'lack_of_basic_conditions'
    )),
    rootCauseDescription TEXT,
    actionTaken TEXT,
    resolvedDate TEXT,
    resolvedBy TEXT,
    cost REAL DEFAULT 0,
    severity TEXT CHECK(severity IN ('minor', 'major', 'critical')) DEFAULT 'minor',
    weekNumber INTEGER,
    year INTEGER,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE CASCADE,
    FOREIGN KEY (assetPartId) REFERENCES AssetPart(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_asset ON MaintenanceSchedule(assetId, year, weekNumber);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_part ON MaintenanceSchedule(assetPartId, year, weekNumber);
CREATE INDEX IF NOT EXISTS idx_breakdown_event_asset ON BreakdownEvent(assetId, year, weekNumber);
CREATE INDEX IF NOT EXISTS idx_breakdown_event_part ON BreakdownEvent(assetPartId);
