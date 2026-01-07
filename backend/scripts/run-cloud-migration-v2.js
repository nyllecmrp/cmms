const { Database } = require('@sqlitecloud/drivers');

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL || 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

  console.log('🔌 Connecting to SQLite Cloud...');
  const db = new Database(dbUrl);

  try {
    console.log('📝 Creating Phase 2/3 tables...\n');

    // Create DataArchive table
    console.log('  Creating DataArchive table...');
    await db.sql`
      CREATE TABLE IF NOT EXISTS DataArchive (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL,
        moduleCode TEXT NOT NULL,
        tableName TEXT NOT NULL,
        recordId TEXT NOT NULL,
        data TEXT NOT NULL,
        archivedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        expiresAt DATETIME,
        status TEXT DEFAULT 'archived',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE
      )
    `;

    // Create Notification table
    console.log('  Creating Notification table...');
    await db.sql`
      CREATE TABLE IF NOT EXISTS Notification (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        link TEXT,
        metadata TEXT,
        isRead INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      )
    `;

    // Create Subscription table
    console.log('  Creating Subscription table...');
    await db.sql`
      CREATE TABLE IF NOT EXISTS Subscription (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL,
        tier TEXT NOT NULL,
        userCount INTEGER NOT NULL,
        billingCycle TEXT NOT NULL,
        monthlyPrice REAL NOT NULL,
        annualPrice REAL NOT NULL,
        totalPrice REAL NOT NULL,
        currency TEXT DEFAULT 'PHP',
        status TEXT DEFAULT 'pending',
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        paymentMethod TEXT,
        cancellationReason TEXT,
        cancelledAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE
      )
    `;

    // Create Payment table
    console.log('  Creating Payment table...');
    await db.sql`
      CREATE TABLE IF NOT EXISTS Payment (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'PHP',
        paymentMethod TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        transactionId TEXT,
        metadata TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE
      )
    `;

    // Create Invoice table
    console.log('  Creating Invoice table...');
    await db.sql`
      CREATE TABLE IF NOT EXISTS Invoice (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL,
        subscriptionId TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'PHP',
        status TEXT DEFAULT 'pending',
        invoiceNumber TEXT UNIQUE NOT NULL,
        dueDate DATETIME NOT NULL,
        paidAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE,
        FOREIGN KEY (subscriptionId) REFERENCES Subscription(id) ON DELETE SET NULL
      )
    `;

    console.log('\n📊 Creating indexes...\n');

    // DataArchive indexes
    await db.sql`CREATE INDEX IF NOT EXISTS idx_data_archive_org ON DataArchive(organizationId)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_data_archive_module ON DataArchive(moduleCode)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_data_archive_status ON DataArchive(status)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_data_archive_expires ON DataArchive(expiresAt)`;

    // Notification indexes
    await db.sql`CREATE INDEX IF NOT EXISTS idx_notification_user ON Notification(userId)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_notification_read ON Notification(isRead)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_notification_created ON Notification(createdAt DESC)`;

    // Subscription indexes
    await db.sql`CREATE INDEX IF NOT EXISTS idx_subscription_org ON Subscription(organizationId)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_subscription_status ON Subscription(status)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_subscription_dates ON Subscription(startDate, endDate)`;

    // Payment indexes
    await db.sql`CREATE INDEX IF NOT EXISTS idx_payment_org ON Payment(organizationId)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_payment_status ON Payment(status)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_payment_transaction ON Payment(transactionId)`;

    // Invoice indexes
    await db.sql`CREATE INDEX IF NOT EXISTS idx_invoice_org ON Invoice(organizationId)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_invoice_number ON Invoice(invoiceNumber)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_invoice_status ON Invoice(status)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_invoice_due ON Invoice(dueDate)`;

    console.log('✅ Migration completed!\n');

    // Verify tables exist
    const tables = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name IN ('Notification', 'DataArchive', 'Subscription', 'Payment', 'Invoice', 'ModuleAccessLog')`;
    console.log('📋 Verification - Tables created:');
    tables.forEach(t => console.log(`  ✅ ${t.name}`));

    if (tables.length === 6) {
      console.log('\n🎉 All 6 tables created successfully!');
    } else {
      console.error(`\n⚠️  Warning: Expected 6 tables but found ${tables.length}`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigration();
