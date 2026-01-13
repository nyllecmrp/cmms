-- Migration: Add Asset Parts Linking
-- Date: 2026-01-12
-- Description: Link assets to inventory items (parts) for machines with hundreds/thousands of parts

-- AssetPart junction table - Links assets to their constituent parts
CREATE TABLE IF NOT EXISTS AssetPart (
    id TEXT PRIMARY KEY,
    assetId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    isPrimary INTEGER DEFAULT 0, -- Flag critical/primary parts
    maintenanceInterval INTEGER, -- Days or cycles before this part needs maintenance
    lastReplacedDate DATETIME,
    nextReplacementDue DATETIME,
    notes TEXT,
    createdById TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assetId) REFERENCES Asset(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES InventoryItem(id) ON DELETE CASCADE,
    FOREIGN KEY (createdById) REFERENCES User(id) ON DELETE RESTRICT,
    UNIQUE(assetId, itemId)
);

CREATE INDEX IF NOT EXISTS idx_asset_part_asset ON AssetPart(assetId);
CREATE INDEX IF NOT EXISTS idx_asset_part_item ON AssetPart(itemId);
CREATE INDEX IF NOT EXISTS idx_asset_part_primary ON AssetPart(isPrimary);
CREATE INDEX IF NOT EXISTS idx_asset_part_next_replacement ON AssetPart(nextReplacementDue);

-- Note: maintenanceParts field already exists in Asset table from earlier migrations
-- This table supplements the old JSON approach with a proper relational structure
