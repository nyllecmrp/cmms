-- Migration: Add Inventory Management Tables
-- Date: 2026-01-08
-- Description: Complete inventory management with full traceability for spare parts

-- StockLocation table for multi-warehouse support
CREATE TABLE IF NOT EXISTS StockLocation (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    contactPerson TEXT,
    contactPhone TEXT,
    isDefault INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stock_location_org ON StockLocation(organizationId);
CREATE INDEX IF NOT EXISTS idx_stock_location_active ON StockLocation(isActive);

-- InventoryCategory table for organizing parts
CREATE TABLE IF NOT EXISTS InventoryCategory (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parentCategoryId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
    FOREIGN KEY (parentCategoryId) REFERENCES InventoryCategory(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_category_org ON InventoryCategory(organizationId);
CREATE INDEX IF NOT EXISTS idx_inventory_category_parent ON InventoryCategory(parentCategoryId);

-- InventoryItem table - Master parts catalog
CREATE TABLE IF NOT EXISTS InventoryItem (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    partNumber TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    categoryId TEXT,
    manufacturer TEXT,
    modelNumber TEXT,
    unitOfMeasure TEXT NOT NULL DEFAULT 'piece', -- piece, box, meter, liter, etc.
    unitCost REAL NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'PHP',
    minimumStock REAL DEFAULT 0,
    maximumStock REAL,
    reorderPoint REAL DEFAULT 0,
    reorderQuantity REAL DEFAULT 0,
    leadTimeDays INTEGER DEFAULT 0,
    supplierId TEXT,
    supplierPartNumber TEXT,
    barcode TEXT,
    qrCode TEXT,
    storageLocation TEXT,
    shelfLife INTEGER, -- days
    warrantyPeriod INTEGER, -- days
    isActive INTEGER DEFAULT 1,
    notes TEXT,
    customFields TEXT, -- JSON string
    createdById TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES InventoryCategory(id) ON DELETE SET NULL,
    FOREIGN KEY (createdById) REFERENCES User(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_part_number ON InventoryItem(organizationId, partNumber);
CREATE INDEX IF NOT EXISTS idx_inventory_org ON InventoryItem(organizationId);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON InventoryItem(categoryId);
CREATE INDEX IF NOT EXISTS idx_inventory_active ON InventoryItem(isActive);
CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON InventoryItem(barcode);

-- InventoryStock table - Current stock levels per location
CREATE TABLE IF NOT EXISTS InventoryStock (
    id TEXT PRIMARY KEY,
    itemId TEXT NOT NULL,
    locationId TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    reservedQuantity REAL NOT NULL DEFAULT 0, -- Reserved for pending work orders
    availableQuantity REAL GENERATED ALWAYS AS (quantity - reservedQuantity) VIRTUAL,
    lastStockTakeDate DATETIME,
    lastStockTakeBy TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itemId) REFERENCES InventoryItem(id) ON DELETE CASCADE,
    FOREIGN KEY (locationId) REFERENCES StockLocation(id) ON DELETE CASCADE,
    FOREIGN KEY (lastStockTakeBy) REFERENCES User(id) ON DELETE SET NULL,
    UNIQUE(itemId, locationId)
);

CREATE INDEX IF NOT EXISTS idx_inventory_stock_item ON InventoryStock(itemId);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_location ON InventoryStock(locationId);

-- InventoryTransaction table - Complete audit trail for all stock movements
CREATE TABLE IF NOT EXISTS InventoryTransaction (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    locationId TEXT NOT NULL,
    transactionType TEXT NOT NULL, -- purchase, usage, adjustment, return, transfer_out, transfer_in, stock_take
    quantity REAL NOT NULL, -- Positive for IN, Negative for OUT
    unitCost REAL,
    totalCost REAL,
    referenceType TEXT, -- work_order, pm_schedule, purchase_order, manual, transfer
    referenceId TEXT, -- ID of the related record
    fromLocationId TEXT, -- For transfers
    toLocationId TEXT, -- For transfers
    reason TEXT,
    notes TEXT,
    performedById TEXT NOT NULL,
    transactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES InventoryItem(id) ON DELETE CASCADE,
    FOREIGN KEY (locationId) REFERENCES StockLocation(id) ON DELETE CASCADE,
    FOREIGN KEY (fromLocationId) REFERENCES StockLocation(id) ON DELETE SET NULL,
    FOREIGN KEY (toLocationId) REFERENCES StockLocation(id) ON DELETE SET NULL,
    FOREIGN KEY (performedById) REFERENCES User(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_inventory_transaction_org ON InventoryTransaction(organizationId);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_item ON InventoryTransaction(itemId);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_location ON InventoryTransaction(locationId);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_type ON InventoryTransaction(transactionType);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_reference ON InventoryTransaction(referenceType, referenceId);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_date ON InventoryTransaction(transactionDate DESC);

-- WorkOrderParts table - Parts used in work orders (FULL TRACEABILITY)
CREATE TABLE IF NOT EXISTS WorkOrderPart (
    id TEXT PRIMARY KEY,
    workOrderId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    locationId TEXT NOT NULL,
    quantityPlanned REAL NOT NULL DEFAULT 0,
    quantityUsed REAL NOT NULL DEFAULT 0,
    unitCost REAL NOT NULL DEFAULT 0,
    totalCost REAL GENERATED ALWAYS AS (quantityUsed * unitCost) VIRTUAL,
    status TEXT DEFAULT 'planned', -- planned, reserved, used, returned
    reservedAt DATETIME,
    usedAt DATETIME,
    installedOn TEXT, -- Asset ID where part was installed
    warrantyExpiresAt DATETIME,
    notes TEXT,
    addedById TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workOrderId) REFERENCES WorkOrder(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES InventoryItem(id) ON DELETE RESTRICT,
    FOREIGN KEY (locationId) REFERENCES StockLocation(id) ON DELETE RESTRICT,
    FOREIGN KEY (installedOn) REFERENCES Asset(id) ON DELETE SET NULL,
    FOREIGN KEY (addedById) REFERENCES User(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_work_order_part_wo ON WorkOrderPart(workOrderId);
CREATE INDEX IF NOT EXISTS idx_work_order_part_item ON WorkOrderPart(itemId);
CREATE INDEX IF NOT EXISTS idx_work_order_part_asset ON WorkOrderPart(installedOn);
CREATE INDEX IF NOT EXISTS idx_work_order_part_status ON WorkOrderPart(status);

-- PMScheduleParts table - Parts templates for preventive maintenance
CREATE TABLE IF NOT EXISTS PMSchedulePart (
    id TEXT PRIMARY KEY,
    pmScheduleId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    quantityRequired REAL NOT NULL DEFAULT 1,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pmScheduleId) REFERENCES PMSchedule(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES InventoryItem(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pm_schedule_part_pm ON PMSchedulePart(pmScheduleId);
CREATE INDEX IF NOT EXISTS idx_pm_schedule_part_item ON PMSchedulePart(itemId);

-- InventorySupplier table - Vendor management for parts
CREATE TABLE IF NOT EXISTS InventorySupplier (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    name TEXT NOT NULL,
    contactPerson TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    taxId TEXT,
    paymentTerms TEXT,
    leadTimeDays INTEGER DEFAULT 0,
    rating REAL, -- 1-5 star rating
    isActive INTEGER DEFAULT 1,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inventory_supplier_org ON InventorySupplier(organizationId);
CREATE INDEX IF NOT EXISTS idx_inventory_supplier_active ON InventorySupplier(isActive);

-- Add supplier foreign key to InventoryItem (already defined in CREATE TABLE above)
-- This is just a comment for clarity

-- StockAlert table - Low stock notifications
CREATE TABLE IF NOT EXISTS StockAlert (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    itemId TEXT NOT NULL,
    alertType TEXT NOT NULL, -- low_stock, out_of_stock, expiring_soon, overstock
    message TEXT NOT NULL,
    isResolved INTEGER DEFAULT 0,
    resolvedAt DATETIME,
    resolvedById TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES InventoryItem(id) ON DELETE CASCADE,
    FOREIGN KEY (resolvedById) REFERENCES User(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_alert_org ON StockAlert(organizationId);
CREATE INDEX IF NOT EXISTS idx_stock_alert_item ON StockAlert(itemId);
CREATE INDEX IF NOT EXISTS idx_stock_alert_resolved ON StockAlert(isResolved);
