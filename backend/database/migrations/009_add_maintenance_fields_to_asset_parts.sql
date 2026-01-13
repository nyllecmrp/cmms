-- Migration: Add Maintenance Fields to AssetPart
-- Date: 2026-01-12
-- Description: Add component classification and maintenance time to asset parts for WCM compliance

-- Add fields to AssetPart table
ALTER TABLE AssetPart ADD COLUMN componentClassification TEXT; -- mechanical, electrical, hydraulic, pneumatic, lubrication, etc
ALTER TABLE AssetPart ADD COLUMN maintenanceTimeMinutes INTEGER; -- Time required to replace/service this part (in minutes)

-- Create index for component classification queries
CREATE INDEX IF NOT EXISTS idx_assetpart_component ON AssetPart(componentClassification);

-- Note: Component Classifications (WCM standard categories):
-- - mechanical: bearings, belts, chains, gears, couplings, seals
-- - electrical: motors, sensors, switches, wiring, contactors
-- - hydraulic: pumps, cylinders, valves, hoses, filters
-- - pneumatic: air cylinders, valves, fittings, regulators
-- - lubrication: oil, grease, lubricants
-- - structural: frames, guards, foundations, supports
-- - control_system: PLC, HMI, controllers, drives
-- - safety: e-stops, guards, interlocks, light curtains
-- - consumable: filters, belts, gaskets, fasteners
