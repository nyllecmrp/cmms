const { Database } = require('@sqlitecloud/drivers');
const { randomBytes } = require('crypto');

async function seedPurchaseRequestsForAcme() {
  const connectionString = 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

  console.log('🔌 Connecting to SQLite Cloud...');
  const db = new Database(connectionString);

  try {
    // Get Acme organization and user
    const orgs = await db.sql("SELECT id FROM Organization WHERE id = 'org-test-1' LIMIT 1");
    const users = await db.sql("SELECT id FROM User WHERE organizationId = 'org-test-1' LIMIT 1");
    const pms = await db.sql("SELECT id, name FROM PMSchedule WHERE organizationId = 'org-test-1'");

    if (!orgs || orgs.length === 0 || !users || users.length === 0) {
      console.error('❌ Acme Manufacturing organization or user not found.');
      process.exit(1);
    }

    const organizationId = orgs[0].id;
    const userId = users[0].id;

    console.log(`📦 Creating sample Purchase Requests for Acme Manufacturing (${organizationId})`);
    console.log(`Found ${pms.length} PM schedules\n`);

    // Sample Purchase Requests linked to PM schedules
    const purchaseRequests = [
      {
        id: randomBytes(16).toString('hex'),
        organizationId,
        requestNumber: 'PR-2025-001',
        title: 'Monthly PM - Hydraulic Pump Parts',
        description: 'Parts needed for Monthly Hydraulic Pump Inspection',
        type: 'pm_schedule',
        priority: 'high',
        status: 'pending',
        pmScheduleId: pms.find(p => p.name.includes('Hydraulic'))?.id,
        items: JSON.stringify([
          { name: 'Hydraulic oil (5L)', quantity: 2, estimatedCost: 3500, price: 3500 },
          { name: 'Oil filter', quantity: 2, estimatedCost: 800, price: 800 },
          { name: 'Air filter', quantity: 2, estimatedCost: 600, price: 600 },
          { name: 'Pressure gauge', quantity: 1, estimatedCost: 2500, price: 2500 }
        ]),
        estimatedCost: 11800,
        requestedById: userId,
        createdAt: '2025-12-10T08:00:00.000Z',
        updatedAt: '2025-12-10T08:00:00.000Z'
      },
      {
        id: randomBytes(16).toString('hex'),
        organizationId,
        requestNumber: 'PR-2025-002',
        title: 'Weekly PM - Generator Maintenance Supplies',
        description: 'Supplies for Weekly Generator Oil Check',
        type: 'pm_schedule',
        priority: 'medium',
        status: 'approved',
        pmScheduleId: pms.find(p => p.name.includes('Generator'))?.id,
        items: JSON.stringify([
          { name: 'Engine oil (1L)', quantity: 10, estimatedCost: 450, price: 450 },
          { name: 'Coolant (500ml)', quantity: 5, estimatedCost: 300, price: 300 },
          { name: 'Battery terminal cleaner', quantity: 2, estimatedCost: 250, price: 250 }
        ]),
        estimatedCost: 6250,
        requestedById: userId,
        approvedById: userId,
        approvedAt: '2025-12-08T10:00:00.000Z',
        createdAt: '2025-12-07T14:00:00.000Z',
        updatedAt: '2025-12-08T10:00:00.000Z'
      },
      {
        id: randomBytes(16).toString('hex'),
        organizationId,
        requestNumber: 'PR-2025-003',
        title: 'Quarterly PM - HVAC Filter Replacement',
        description: 'Parts for Quarterly HVAC Filter Replacement',
        type: 'pm_schedule',
        priority: 'high',
        status: 'pending',
        pmScheduleId: pms.find(p => p.name.includes('HVAC Filter Replacement'))?.id,
        items: JSON.stringify([
          { name: 'HEPA air filters (4x)', quantity: 4, estimatedCost: 1200, price: 1200 },
          { name: 'Coil cleaner', quantity: 2, estimatedCost: 800, price: 800 },
          { name: 'Refrigerant (if needed)', quantity: 1, estimatedCost: 3500, price: 3500 },
          { name: 'Thermostat batteries', quantity: 4, estimatedCost: 100, price: 100 }
        ]),
        estimatedCost: 9300,
        requestedById: userId,
        createdAt: '2025-12-09T09:00:00.000Z',
        updatedAt: '2025-12-09T09:00:00.000Z'
      },
      {
        id: randomBytes(16).toString('hex'),
        organizationId,
        requestNumber: 'PR-2025-004',
        title: 'Quarterly PM - HVAC Filter Change Test',
        description: 'Test filters for quarterly maintenance',
        type: 'pm_schedule',
        priority: 'low',
        status: 'approved',
        pmScheduleId: pms.find(p => p.name.includes('Test'))?.id,
        items: JSON.stringify([
          { name: 'HVAC Filter 20x25x1', quantity: 4, estimatedCost: 25, price: 25 },
          { name: 'Filter Gasket', quantity: 4, estimatedCost: 5, price: 5 }
        ]),
        estimatedCost: 120,
        requestedById: userId,
        approvedById: userId,
        approvedAt: '2025-11-30T15:00:00.000Z',
        createdAt: '2025-11-29T11:00:00.000Z',
        updatedAt: '2025-11-30T15:00:00.000Z'
      },
      {
        id: randomBytes(16).toString('hex'),
        organizationId,
        requestNumber: 'PR-2025-005',
        title: 'Spare Parts - Emergency Stock',
        description: 'Emergency spare parts for critical equipment',
        type: 'manual',
        priority: 'medium',
        status: 'rejected',
        items: JSON.stringify([
          { name: 'Emergency LED lights', quantity: 10, estimatedCost: 350, price: 350 },
          { name: 'Backup fuses', quantity: 20, estimatedCost: 50, price: 50 },
          { name: 'Wire connectors assorted', quantity: 5, estimatedCost: 200, price: 200 }
        ]),
        estimatedCost: 4500,
        requestedById: userId,
        approvedById: userId,
        approvedAt: '2025-12-05T16:00:00.000Z',
        rejectionReason: 'Budget constraints - defer to next quarter',
        createdAt: '2025-12-04T13:00:00.000Z',
        updatedAt: '2025-12-05T16:00:00.000Z'
      }
    ];

    // Insert Purchase Requests
    for (const pr of purchaseRequests) {
      const insertSQL = `
        INSERT INTO PurchaseRequest (
          id, organizationId, requestNumber, title, description, type, priority, status,
          pmScheduleId, items, estimatedCost, requestedById, approvedById, approvedAt,
          rejectionReason, createdAt, updatedAt
        ) VALUES (
          '${pr.id}', '${pr.organizationId}', '${pr.requestNumber}', '${pr.title}',
          '${pr.description}', '${pr.type}', '${pr.priority}', '${pr.status}',
          ${pr.pmScheduleId ? `'${pr.pmScheduleId}'` : 'NULL'},
          '${pr.items}', ${pr.estimatedCost}, '${pr.requestedById}',
          ${pr.approvedById ? `'${pr.approvedById}'` : 'NULL'},
          ${pr.approvedAt ? `'${pr.approvedAt}'` : 'NULL'},
          ${pr.rejectionReason ? `'${pr.rejectionReason}'` : 'NULL'},
          '${pr.createdAt}', '${pr.updatedAt}'
        )
      `;

      await db.sql(insertSQL);
      console.log(`  ✅ Created PR: ${pr.requestNumber} - ${pr.title} (${pr.status})`);
    }

    console.log('\n✅ Successfully created 5 sample Purchase Requests for Acme Manufacturing!');
    console.log('\nPR Status Summary:');
    console.log('  - 2 Pending (awaiting approval)');
    console.log('  - 2 Approved (ready to generate POs)');
    console.log('  - 1 Rejected (budget constraints)');

  } catch (error) {
    console.error('❌ Error seeding Purchase Requests:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

seedPurchaseRequestsForAcme();
