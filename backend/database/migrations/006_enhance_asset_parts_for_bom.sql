-- Migration: Enhance AssetPart for Bill of Materials (BOM)
-- Date: 2026-01-12
-- Description: Allow parts to be defined directly on assets without requiring inventory items first

-- Add columns to AssetPart to support standalone part definitions
-- These allow defining parts as part of machine BOM even if not in inventory yet

ALTER TABLE AssetPart ADD COLUMN partNumber TEXT;
ALTER TABLE AssetPart ADD COLUMN partName TEXT;
ALTER TABLE AssetPart ADD COLUMN description TEXT;
ALTER TABLE AssetPart ADD COLUMN manufacturer TEXT;
ALTER TABLE AssetPart ADD COLUMN modelNumber TEXT;
ALTER TABLE AssetPart ADD COLUMN unitOfMeasure TEXT DEFAULT 'EA';

-- Make itemId nullable so parts can be defined without inventory items
-- This will be handled in application logic since SQLite doesn't support ALTER COLUMN

-- Add indices for performance
CREATE INDEX IF NOT EXISTS idx_assetpart_partnumber ON AssetPart(partNumber);
CREATE INDEX IF NOT EXISTS idx_assetpart_partname ON AssetPart(partName);

-- Note: When itemId is NULL, the part is defined directly on the asset (BOM entry)
-- When itemId is NOT NULL, the part is linked to inventory for stock management
