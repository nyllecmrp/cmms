-- Create PurchaseOrder table
CREATE TABLE IF NOT EXISTS PurchaseOrder (
  id TEXT PRIMARY KEY,
  organizationId TEXT NOT NULL,
  poNumber TEXT NOT NULL UNIQUE,
  purchaseRequestId TEXT,
  
  -- Supplier Information
  supplierName TEXT NOT NULL,
  supplierContact TEXT,
  supplierEmail TEXT,
  supplierAddress TEXT,
  
  -- Order Details
  items TEXT NOT NULL,
  subtotal REAL DEFAULT 0,
  tax REAL DEFAULT 0,
  shippingCost REAL DEFAULT 0,
  totalCost REAL DEFAULT 0,
  
  -- Status & Tracking
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'medium',
  
  -- Dates
  orderDate TEXT,
  expectedDelivery TEXT,
  actualDelivery TEXT,
  
  -- Additional Info
  notes TEXT,
  termsAndConditions TEXT,
  paymentTerms TEXT,
  shippingMethod TEXT,
  
  -- Audit
  createdById TEXT NOT NULL,
  approvedById TEXT,
  approvedAt TEXT,
  receivedById TEXT,
  receivedAt TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (organizationId) REFERENCES Organization(id),
  FOREIGN KEY (purchaseRequestId) REFERENCES PurchaseRequest(id),
  FOREIGN KEY (createdById) REFERENCES User(id)
);

CREATE INDEX IF NOT EXISTS idx_po_organization ON PurchaseOrder(organizationId);
CREATE INDEX IF NOT EXISTS idx_po_status ON PurchaseOrder(status);
CREATE INDEX IF NOT EXISTS idx_po_pr ON PurchaseOrder(purchaseRequestId);
