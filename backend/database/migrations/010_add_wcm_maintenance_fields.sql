-- Migration 010: Add WCM (World Class Manufacturing) Maintenance Fields to AssetPart

-- Add PM (Preventive Maintenance) fields
ALTER TABLE AssetPart ADD COLUMN pmType TEXT CHECK(pmType IN ('TBM', 'CBM', 'BDM')) DEFAULT NULL;
ALTER TABLE AssetPart ADD COLUMN smpNumber INTEGER DEFAULT NULL;
ALTER TABLE AssetPart ADD COLUMN frequencyPM TEXT DEFAULT NULL;
ALTER TABLE AssetPart ADD COLUMN machineStopRequired TEXT CHECK(machineStopRequired IN ('STOP', 'Running')) DEFAULT 'STOP';

-- Add AM (Autonomous Maintenance) fields
ALTER TABLE AssetPart ADD COLUMN inspectionStandard TEXT DEFAULT NULL;
ALTER TABLE AssetPart ADD COLUMN frequencyAM TEXT DEFAULT NULL;

-- Add QM (Quality Maintenance) fields
ALTER TABLE AssetPart ADD COLUMN qaMatrixNo INTEGER DEFAULT NULL;
ALTER TABLE AssetPart ADD COLUMN qmMatrixNo INTEGER DEFAULT NULL;

-- Add FI (Focused Improvement / Kaizen) fields
ALTER TABLE AssetPart ADD COLUMN kaizenType TEXT CHECK(kaizenType IN ('Cost', 'Reliability', 'Availability')) DEFAULT NULL;
ALTER TABLE AssetPart ADD COLUMN kaizenNo TEXT DEFAULT NULL;

-- Add additional part identification fields
ALTER TABLE AssetPart ADD COLUMN storeroomLocation TEXT DEFAULT NULL;
ALTER TABLE AssetPart ADD COLUMN vendor TEXT DEFAULT NULL;
ALTER TABLE AssetPart ADD COLUMN drawingPicture TEXT DEFAULT NULL;
