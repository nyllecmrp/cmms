-- Migration: Add SAP Number to AssetPart
-- Date: 2026-01-12
-- Description: Add SAP Number field to support SAP integration and distinguish from internal part numbers

ALTER TABLE AssetPart ADD COLUMN sapNumber TEXT;

-- Add index for SAP number lookups
CREATE INDEX IF NOT EXISTS idx_assetpart_sapnumber ON AssetPart(sapNumber);

-- Note: SAP Number is different from partNumber
-- partNumber: Internal/manufacturer part number
-- sapNumber: SAP system material number
