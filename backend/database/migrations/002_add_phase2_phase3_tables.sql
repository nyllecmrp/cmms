-- Migration: Add Phase 2 and Phase 3 Tables
-- Date: 2026-01-07
-- Description: Add tables for Module Licensing, Notifications, Billing, and Data Archival

-- DataArchive table for storing archived module data
CREATE TABLE IF NOT EXISTS DataArchive (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    moduleCode TEXT NOT NULL,
    tableName TEXT NOT NULL,
    recordId TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON string
    archivedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME,
    status TEXT DEFAULT 'archived', -- archived, restored, deleted
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_data_archive_org ON DataArchive(organizationId);
CREATE INDEX IF NOT EXISTS idx_data_archive_module ON DataArchive(moduleCode);
CREATE INDEX IF NOT EXISTS idx_data_archive_status ON DataArchive(status);
CREATE INDEX IF NOT EXISTS idx_data_archive_expires ON DataArchive(expiresAt);

-- Notification table for user notifications
CREATE TABLE IF NOT EXISTS Notification (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, warning, error, success
    link TEXT,
    metadata TEXT, -- JSON string
    isRead INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_user ON Notification(userId);
CREATE INDEX IF NOT EXISTS idx_notification_read ON Notification(isRead);
CREATE INDEX IF NOT EXISTS idx_notification_created ON Notification(createdAt DESC);

-- Subscription table for billing
CREATE TABLE IF NOT EXISTS Subscription (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    tier TEXT NOT NULL, -- starter, professional, enterprise, enterprise_plus
    userCount INTEGER NOT NULL,
    billingCycle TEXT NOT NULL, -- monthly, annual
    monthlyPrice REAL NOT NULL,
    annualPrice REAL NOT NULL,
    totalPrice REAL NOT NULL,
    currency TEXT DEFAULT 'PHP',
    status TEXT DEFAULT 'pending', -- pending, active, cancelled, expired
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    paymentMethod TEXT, -- gcash, paymaya, bank_transfer, credit_card
    cancellationReason TEXT,
    cancelledAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subscription_org ON Subscription(organizationId);
CREATE INDEX IF NOT EXISTS idx_subscription_status ON Subscription(status);
CREATE INDEX IF NOT EXISTS idx_subscription_dates ON Subscription(startDate, endDate);

-- Payment table for tracking payments
CREATE TABLE IF NOT EXISTS Payment (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'PHP',
    paymentMethod TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
    transactionId TEXT,
    metadata TEXT, -- JSON string
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payment_org ON Payment(organizationId);
CREATE INDEX IF NOT EXISTS idx_payment_status ON Payment(status);
CREATE INDEX IF NOT EXISTS idx_payment_transaction ON Payment(transactionId);

-- Invoice table for generating invoices
CREATE TABLE IF NOT EXISTS Invoice (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    subscriptionId TEXT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'PHP',
    status TEXT DEFAULT 'pending', -- pending, paid, overdue, cancelled
    invoiceNumber TEXT UNIQUE NOT NULL,
    dueDate DATETIME NOT NULL,
    paidAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
    FOREIGN KEY (subscriptionId) REFERENCES Subscription(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_invoice_org ON Invoice(organizationId);
CREATE INDEX IF NOT EXISTS idx_invoice_number ON Invoice(invoiceNumber);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON Invoice(status);
CREATE INDEX IF NOT EXISTS idx_invoice_due ON Invoice(dueDate);

-- Add tier column to Organization if it doesn't exist
-- This will fail silently if column already exists (SQLite limitation)
-- ALTER TABLE Organization ADD COLUMN tier TEXT DEFAULT 'starter';

-- Update existing ModuleAccessLog table if needed
CREATE TABLE IF NOT EXISTS ModuleAccessLog (
    id TEXT PRIMARY KEY,
    organizationId TEXT NOT NULL,
    userId TEXT,
    moduleCode TEXT NOT NULL,
    action TEXT NOT NULL, -- accessed, denied, activated, deactivated
    ipAddress TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_module_access_org ON ModuleAccessLog(organizationId);
CREATE INDEX IF NOT EXISTS idx_module_access_module ON ModuleAccessLog(moduleCode);
CREATE INDEX IF NOT EXISTS idx_module_access_action ON ModuleAccessLog(action);
CREATE INDEX IF NOT EXISTS idx_module_access_timestamp ON ModuleAccessLog(timestamp DESC);
