-- Migration: Enhance Maintenance Tracking
-- Date: 2026-01-12
-- Description: Add component classification, activity frequency, machine cycle tracking, and maintenance time

-- Add fields to PMSchedule table
ALTER TABLE PMSchedule ADD COLUMN componentClassification TEXT; -- mechanical, electrical, hydraulic, pneumatic, lubrication, etc
ALTER TABLE PMSchedule ADD COLUMN activityFrequencyWeeks INTEGER; -- Frequency in weeks
ALTER TABLE PMSchedule ADD COLUMN basedOnMachineCycle INTEGER DEFAULT 0; -- 0=time-based, 1=cycle/hour-based
ALTER TABLE PMSchedule ADD COLUMN machineCycleInterval INTEGER; -- Operating hours/cycles between maintenance
ALTER TABLE PMSchedule ADD COLUMN maintenanceTimeMinutes INTEGER; -- Estimated time in minutes

-- Add fields to WorkOrder table
ALTER TABLE WorkOrder ADD COLUMN componentClassification TEXT;
ALTER TABLE WorkOrder ADD COLUMN maintenanceTimeMinutes INTEGER; -- Actual time spent in minutes
ALTER TABLE WorkOrder ADD COLUMN machineHoursAtMaintenance INTEGER; -- Machine hours/cycles at time of maintenance

-- Create index for component classification queries
CREATE INDEX IF NOT EXISTS idx_pmschedule_component ON PMSchedule(componentClassification);
CREATE INDEX IF NOT EXISTS idx_workorder_component ON WorkOrder(componentClassification);

-- Create index for cycle-based maintenance
CREATE INDEX IF NOT EXISTS idx_pmschedule_cycle_based ON PMSchedule(basedOnMachineCycle);

-- Note: Component Classifications (typical WCM categories):
-- - mechanical: bearings, belts, chains, gears, couplings
-- - electrical: motors, sensors, switches, wiring
-- - hydraulic: pumps, cylinders, valves, hoses
-- - pneumatic: air cylinders, valves, fittings
-- - lubrication: oil changes, grease points
-- - structural: frames, guards, foundations
-- - control_system: PLC, HMI, controllers
-- - safety: e-stops, guards, interlocks
