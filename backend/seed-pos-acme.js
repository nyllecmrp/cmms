const { Database } = require('@sqlitecloud/drivers');
const { randomBytes } = require('crypto');

async function seedPurchaseOrdersForAcme() {
  const connectionString = 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

  console.log('🔌 Connecting to SQLite Cloud...');
  const db = new Database(connectionString);

  try {
    // Get Acme organization and user
    const orgs = await db.sql("SELECT id FROM Organization WHERE id = 'org-test-1' LIMIT 1");
    if (!orgs || orgs.length === 0) {
      console.error('❌ Acme Manufacturing organization not found.');
      process.exit(1);
    }

    const users = await db.sql("SELECT id FROM User WHERE organizationId = 'org-test-1' LIMIT 1");

    if (!users || users.length === 0) {
      console.error('❌ No user found for Acme Manufacturing.');
      process.exit(1);
    }

    const organizationId = orgs[0].id;
    const userId = users[0].id;

    console.log(`📦 Creating sample Purchase Orders for Acme Manufacturing (${organizationId})`);

    // Sample Purchase Orders for Acme
    const purchaseOrders = [
      {
        id: randomBytes(16).toString('hex'),
        organizationId,
        poNumber: 'PO-2024-1001',
        supplierName: 'Industrial Parts Supplier Inc.',
        supplierContact: '+63 917 123 4567',
        supplierEmail: 'sales@industrialparts.com',
        supplierAddress: '123 Industrial Ave, Makati City, Philippines',
        items: JSON.stringify([
          { name: 'Hydraulic Pump', quantity: 2, estimatedCost: 15000, price: 15000 },
          { name: 'Conveyor Belt', quantity: 1, estimatedCost: 25000, price: 25000 },
          { name: 'Motor Bearings', quantity: 10, estimatedCost: 500, price: 500 }
        ]),
        subtotal: 60000,
        tax: 7200, // 12%
        shippingCost: 2000,
        totalCost: 69200,
        status: 'sent',
        priority: 'high',
        orderDate: '2024-12-01',
        expectedDelivery: '2024-12-15',
        notes: 'Urgent delivery required for production line maintenance',
        termsAndConditions: 'Payment terms: Net 30 days. Warranty: 1 year on all parts.',
        paymentTerms: '30 days',
        shippingMethod: 'Express',
        createdById: userId,
        approvedById: userId,
        approvedAt: '2024-12-01T10:00:00.000Z',
        createdAt: '2024-12-01T09:00:00.000Z',
        updatedAt: '2024-12-01T10:00:00.000Z'
      },
      {
        id: randomBytes(16).toString('hex'),
        organizationId,
        poNumber: 'PO-2024-1002',
        supplierName: 'Tech Equipment Solutions',
        supplierContact: '+63 918 234 5678',
        supplierEmail: 'orders@techequip.ph',
        supplierAddress: '456 Tech Hub, Quezon City, Philippines',
        items: JSON.stringify([
          { name: 'Temperature Sensors', quantity: 15, estimatedCost: 800, price: 800 },
          { name: 'Control Panel Display', quantity: 3, estimatedCost: 12000, price: 12000 },
          { name: 'Wiring Harness', quantity: 5, estimatedCost: 2000, price: 2000 }
        ]),
        subtotal: 58000,
        tax: 6960,
        shippingCost: 1500,
        totalCost: 66460,
        status: 'shipped',
        priority: 'medium',
        orderDate: '2024-12-03',
        expectedDelivery: '2024-12-18',
        notes: 'For automation system upgrade',
        termsAndConditions: 'Standard terms and conditions apply.',
        paymentTerms: 'COD',
        shippingMethod: 'Standard',
        createdById: userId,
        approvedById: userId,
        approvedAt: '2024-12-03T14:00:00.000Z',
        createdAt: '2024-12-03T13:00:00.000Z',
        updatedAt: '2024-12-03T14:00:00.000Z'
      },
      {
        id: randomBytes(16).toString('hex'),
        organizationId,
        poNumber: 'PO-2024-1003',
        supplierName: 'Safety & Maintenance Co.',
        supplierContact: '+63 919 345 6789',
        supplierEmail: 'info@safetymaint.com',
        supplierAddress: '789 Safety Street, Pasig City, Philippines',
        items: JSON.stringify([
          { name: 'Safety Gloves (Pairs)', quantity: 50, estimatedCost: 150, price: 150 },
          { name: 'Hard Hats', quantity: 20, estimatedCost: 500, price: 500 },
          { name: 'Safety Goggles', quantity: 30, estimatedCost: 300, price: 300 },
          { name: 'Fire Extinguishers', quantity: 10, estimatedCost: 2500, price: 2500 }
        ]),
        subtotal: 51500,
        tax: 6180,
        shippingCost: 1000,
        totalCost: 58680,
        status: 'received',
        priority: 'medium',
        orderDate: '2024-11-25',
        expectedDelivery: '2024-12-05',
        actualDelivery: '2024-12-04',
        notes: 'Safety equipment for new facility',
        termsAndConditions: 'Standard terms and conditions apply.',
        paymentTerms: '30 days',
        shippingMethod: 'Standard',
        createdById: userId,
        approvedById: userId,
        approvedAt: '2024-11-25T11:00:00.000Z',
        receivedById: userId,
        receivedAt: '2024-12-04T15:30:00.000Z',
        createdAt: '2024-11-25T10:00:00.000Z',
        updatedAt: '2024-12-04T15:30:00.000Z'
      },
      {
        id: randomBytes(16).toString('hex'),
        organizationId,
        poNumber: 'PO-2024-1004',
        supplierName: 'Maintenance Supplies Direct',
        supplierContact: '+63 920 456 7890',
        supplierEmail: 'support@maintsupplies.ph',
        supplierAddress: '321 Supply Road, Mandaluyong City, Philippines',
        items: JSON.stringify([
          { name: 'Lubricating Oil (20L)', quantity: 10, estimatedCost: 3000, price: 3000 },
          { name: 'Cleaning Solvents (5L)', quantity: 20, estimatedCost: 800, price: 800 },
          { name: 'Grease (1kg)', quantity: 15, estimatedCost: 600, price: 600 }
        ]),
        subtotal: 55000,
        tax: 6600,
        shippingCost: 800,
        totalCost: 62400,
        status: 'draft',
        priority: 'low',
        orderDate: '2024-12-11',
        expectedDelivery: '2024-12-25',
        notes: 'Monthly maintenance supplies order',
        termsAndConditions: 'Standard terms and conditions apply.',
        paymentTerms: '15 days',
        shippingMethod: 'Standard',
        createdById: userId,
        createdAt: '2024-12-11T08:00:00.000Z',
        updatedAt: '2024-12-11T08:00:00.000Z'
      },
      {
        id: randomBytes(16).toString('hex'),
        organizationId,
        poNumber: 'PO-2024-1005',
        supplierName: 'Electronic Components Hub',
        supplierContact: '+63 921 567 8901',
        supplierEmail: 'sales@electronichub.com',
        supplierAddress: '555 Electronics Plaza, Taguig City, Philippines',
        items: JSON.stringify([
          { name: 'PLC Module', quantity: 2, estimatedCost: 18000, price: 18000 },
          { name: 'Relay Switches', quantity: 25, estimatedCost: 400, price: 400 },
          { name: 'Circuit Breakers', quantity: 15, estimatedCost: 1200, price: 1200 }
        ]),
        subtotal: 64000,
        tax: 7680,
        shippingCost: 1200,
        totalCost: 72880,
        status: 'confirmed',
        priority: 'high',
        orderDate: '2024-12-08',
        expectedDelivery: '2024-12-20',
        notes: 'For electrical system overhaul',
        termsAndConditions: 'Payment terms: 50% upfront, 50% on delivery.',
        paymentTerms: '50/50',
        shippingMethod: 'Express',
        createdById: userId,
        approvedById: userId,
        approvedAt: '2024-12-08T16:00:00.000Z',
        createdAt: '2024-12-08T15:00:00.000Z',
        updatedAt: '2024-12-08T16:00:00.000Z'
      }
    ];

    // Insert Purchase Orders
    for (const po of purchaseOrders) {
      const insertSQL = `
        INSERT INTO PurchaseOrder (
          id, organizationId, poNumber, supplierName, supplierContact, supplierEmail, supplierAddress,
          items, subtotal, tax, shippingCost, totalCost, status, priority,
          orderDate, expectedDelivery, actualDelivery, notes, termsAndConditions, paymentTerms, shippingMethod,
          createdById, approvedById, approvedAt, receivedById, receivedAt, createdAt, updatedAt
        ) VALUES (
          '${po.id}', '${po.organizationId}', '${po.poNumber}', '${po.supplierName}',
          '${po.supplierContact}', '${po.supplierEmail}', '${po.supplierAddress}',
          '${po.items}', ${po.subtotal}, ${po.tax}, ${po.shippingCost}, ${po.totalCost},
          '${po.status}', '${po.priority}', '${po.orderDate}', '${po.expectedDelivery}',
          ${po.actualDelivery ? `'${po.actualDelivery}'` : 'NULL'},
          '${po.notes}', '${po.termsAndConditions}', '${po.paymentTerms}', '${po.shippingMethod}',
          '${po.createdById}', ${po.approvedById ? `'${po.approvedById}'` : 'NULL'},
          ${po.approvedAt ? `'${po.approvedAt}'` : 'NULL'},
          ${po.receivedById ? `'${po.receivedById}'` : 'NULL'},
          ${po.receivedAt ? `'${po.receivedAt}'` : 'NULL'},
          '${po.createdAt}', '${po.updatedAt}'
        )
      `;

      await db.sql(insertSQL);
      console.log(`  ✅ Created PO: ${po.poNumber} - ${po.supplierName} (${po.status})`);
    }

    console.log('\n✅ Successfully created 5 sample Purchase Orders for Acme Manufacturing!');
    console.log('\nPO Status Summary:');
    console.log('  - 1 Draft (not yet sent)');
    console.log('  - 1 Sent (waiting for supplier confirmation)');
    console.log('  - 1 Confirmed (supplier confirmed)');
    console.log('  - 1 Shipped (in transit)');
    console.log('  - 1 Received (completed)');

  } catch (error) {
    console.error('❌ Error seeding Purchase Orders:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

seedPurchaseOrdersForAcme();
