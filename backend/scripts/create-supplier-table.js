const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function createSupplierTable() {
  console.log('📦 Creating Supplier table...\n');

  try {
    // Create Supplier table
    await db.sql`
      CREATE TABLE IF NOT EXISTS Supplier (
        id TEXT PRIMARY KEY,
        organizationId TEXT NOT NULL,
        name TEXT NOT NULL,
        contactPerson TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        website TEXT,
        taxId TEXT,
        paymentTerms TEXT,
        supplierType TEXT,
        status TEXT DEFAULT 'active',
        rating INTEGER,
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        createdById TEXT,
        FOREIGN KEY (organizationId) REFERENCES Organization(id),
        FOREIGN KEY (createdById) REFERENCES User(id)
      )
    `;

    console.log('✅ Supplier table created successfully!\n');

    // Seed sample suppliers
    console.log('🌱 Seeding sample suppliers...\n');

    const org = await db.sql`SELECT id FROM Organization LIMIT 1`;
    const organizationId = org[0].id;

    const user = await db.sql`SELECT id FROM User LIMIT 1`;
    const userId = user[0]?.id;

    const suppliers = [
      {
        id: 'supplier-001',
        name: 'ABC Industrial Parts Inc.',
        contactPerson: 'Michael Chen',
        email: 'sales@abcindustrial.com',
        phone: '+63 2 8123 4567',
        address: '1234 Industrial Avenue, Makati',
        city: 'Makati City',
        country: 'Philippines',
        website: 'www.abcindustrial.com',
        taxId: 'TIN-123-456-789',
        paymentTerms: '30 days',
        supplierType: 'Parts & Components',
        status: 'active',
        rating: 5,
        notes: 'Preferred supplier for hydraulic components. Fast delivery, excellent quality.',
      },
      {
        id: 'supplier-002',
        name: 'XYZ Tools & Equipment Ltd.',
        contactPerson: 'Sarah Martinez',
        email: 'info@xyztools.ph',
        phone: '+63 2 8234 5678',
        address: '5678 Equipment Street, Quezon City',
        city: 'Quezon City',
        country: 'Philippines',
        website: 'www.xyztools.ph',
        taxId: 'TIN-234-567-890',
        paymentTerms: '45 days',
        supplierType: 'Tools & Equipment',
        status: 'active',
        rating: 4,
        notes: 'Good for cutting tools and precision instruments. Occasional delays.',
      },
      {
        id: 'supplier-003',
        name: 'Global Bearing Solutions',
        contactPerson: 'James Lee',
        email: 'contact@globalbearing.com',
        phone: '+63 2 8345 6789',
        address: '9012 Bearing Boulevard, Pasig',
        city: 'Pasig City',
        country: 'Philippines',
        website: 'www.globalbearing.com',
        taxId: 'TIN-345-678-901',
        paymentTerms: '60 days',
        supplierType: 'Bearings & Seals',
        status: 'active',
        rating: 5,
        notes: 'Specialist in bearings and seals. Premium quality, competitive pricing.',
      },
      {
        id: 'supplier-004',
        name: 'Electrical Components Direct',
        contactPerson: 'Maria Santos',
        email: 'orders@electricaldirect.ph',
        phone: '+63 2 8456 7890',
        address: '3456 Electric Drive, Mandaluyong',
        city: 'Mandaluyong City',
        country: 'Philippines',
        website: 'www.electricaldirect.ph',
        taxId: 'TIN-456-789-012',
        paymentTerms: '30 days',
        supplierType: 'Electrical Components',
        status: 'active',
        rating: 4,
        notes: 'Wide range of electrical parts. Good pricing but minimum order quantity applies.',
      },
      {
        id: 'supplier-005',
        name: 'Premium Lubricants Corp.',
        contactPerson: 'Robert Tan',
        email: 'sales@premiumlube.com',
        phone: '+63 2 8567 8901',
        address: '7890 Lubricant Lane, Taguig',
        city: 'Taguig City',
        country: 'Philippines',
        website: 'www.premiumlube.com',
        taxId: 'TIN-567-890-123',
        paymentTerms: '30 days',
        supplierType: 'Lubricants & Fluids',
        status: 'active',
        rating: 5,
        notes: 'High-quality industrial lubricants. Excellent technical support.',
      },
      {
        id: 'supplier-006',
        name: 'Safety First Equipment',
        contactPerson: 'Lisa Garcia',
        email: 'info@safetyfirst.ph',
        phone: '+63 2 8678 9012',
        address: '2345 Safety Street, Paranaque',
        city: 'Paranaque City',
        country: 'Philippines',
        website: 'www.safetyfirst.ph',
        taxId: 'TIN-678-901-234',
        paymentTerms: '45 days',
        supplierType: 'Safety Equipment',
        status: 'active',
        rating: 4,
        notes: 'PPE and safety equipment. Competitive prices, good stock availability.',
      },
      {
        id: 'supplier-007',
        name: 'Industrial Fasteners Plus',
        contactPerson: 'David Wong',
        email: 'sales@fasteners.com.ph',
        phone: '+63 2 8789 0123',
        address: '6789 Fastener Avenue, Muntinlupa',
        city: 'Muntinlupa City',
        country: 'Philippines',
        website: 'www.fasteners.com.ph',
        taxId: 'TIN-789-012-345',
        paymentTerms: '30 days',
        supplierType: 'Fasteners & Hardware',
        status: 'active',
        rating: 4,
        notes: 'Complete range of fasteners. Bulk discounts available.',
      },
      {
        id: 'supplier-008',
        name: 'Pneumatic Systems International',
        contactPerson: 'Jennifer Cruz',
        email: 'info@pneumaticsys.com',
        phone: '+63 2 8890 1234',
        address: '4567 Pneumatic Plaza, Caloocan',
        city: 'Caloocan City',
        country: 'Philippines',
        website: 'www.pneumaticsys.com',
        taxId: 'TIN-890-123-456',
        paymentTerms: '60 days',
        supplierType: 'Pneumatic Components',
        status: 'active',
        rating: 5,
        notes: 'Specialized pneumatic systems. Expert technical assistance.',
      },
      {
        id: 'supplier-009',
        name: 'Coolant Technologies Asia',
        contactPerson: 'Peter Reyes',
        email: 'sales@coolanttech.asia',
        phone: '+63 2 8901 2345',
        address: '8901 Coolant Circle, Las Pinas',
        city: 'Las Pinas City',
        country: 'Philippines',
        website: 'www.coolanttech.asia',
        taxId: 'TIN-901-234-567',
        paymentTerms: '45 days',
        supplierType: 'Coolants & Chemicals',
        status: 'active',
        rating: 4,
        notes: 'Industrial coolants and cutting fluids. Good technical documentation.',
      },
      {
        id: 'supplier-010',
        name: 'Quick Delivery Parts Hub',
        contactPerson: 'Anna Mendoza',
        email: 'orders@quickparts.ph',
        phone: '+63 2 8012 3456',
        address: '1122 Express Way, Valenzuela',
        city: 'Valenzuela City',
        country: 'Philippines',
        website: 'www.quickparts.ph',
        taxId: 'TIN-012-345-678',
        paymentTerms: '30 days',
        supplierType: 'General Parts',
        status: 'active',
        rating: 3,
        notes: 'Same-day delivery for urgent orders. Limited product range.',
      },
    ];

    for (const supplier of suppliers) {
      await db.sql`
        INSERT OR REPLACE INTO Supplier (
          id, organizationId, name, contactPerson, email, phone,
          address, city, country, website, taxId, paymentTerms,
          supplierType, status, rating, notes, createdAt, updatedAt, createdById
        ) VALUES (
          ${supplier.id}, ${organizationId}, ${supplier.name}, ${supplier.contactPerson},
          ${supplier.email}, ${supplier.phone}, ${supplier.address}, ${supplier.city},
          ${supplier.country}, ${supplier.website}, ${supplier.taxId}, ${supplier.paymentTerms},
          ${supplier.supplierType}, ${supplier.status}, ${supplier.rating}, ${supplier.notes},
          datetime('now'), datetime('now'), ${userId}
        )
      `;
      console.log(`  ✓ Added: ${supplier.name}`);
    }

    console.log('\n✅ Successfully seeded 10 sample suppliers!');
    console.log('\n📊 Summary:');
    console.table(suppliers.map(s => ({
      Name: s.name,
      Type: s.supplierType,
      Contact: s.contactPerson,
      Rating: '⭐'.repeat(s.rating),
    })));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

createSupplierTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
