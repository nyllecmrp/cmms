const { Database } = require('@sqlitecloud/drivers');

async function updatePMDates() {
  const connectionString = 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

  console.log('🔌 Connecting to SQLite Cloud...');
  const db = new Database(connectionString);

  try {
    // Get Acme PM schedules
    const pms = await db.sql("SELECT id, name, frequency, nextDue FROM PMSchedule WHERE organizationId = 'org-test-1'");

    console.log(`📅 Updating ${pms.length} PM schedules for Acme Manufacturing...\n`);

    // Today is December 11, 2024
    const today = new Date('2024-12-11');

    // Update dates to be more realistic
    const updates = [
      {
        // Some completed recently, next due in future
        name: 'Weekly Generator Oil Check',
        lastCompleted: '2024-12-09',
        nextDue: '2024-12-16',
        status: 'active'
      },
      {
        // Due soon
        name: 'Monthly Hydraulic Pump Inspection',
        lastCompleted: '2024-11-13',
        nextDue: '2024-12-13',
        status: 'active'
      },
      {
        // Slightly overdue
        name: 'Quarterly HVAC Filter Replacement',
        lastCompleted: '2024-09-05',
        nextDue: '2024-12-05',
        status: 'overdue'
      },
      {
        // Due in future
        name: 'Quarterly HVAC Filter Change - Test',
        lastCompleted: '2024-09-15',
        nextDue: '2024-12-25',
        status: 'active'
      }
    ];

    for (const pm of pms) {
      const update = updates.find(u => pm.name.includes(u.name.substring(0, 20)));

      if (update) {
        await db.sql(`
          UPDATE PMSchedule
          SET lastCompleted = '${update.lastCompleted}',
              nextDue = '${update.nextDue}',
              status = '${update.status}'
          WHERE id = '${pm.id}'
        `);

        console.log(`  ✅ Updated: ${pm.name}`);
        console.log(`     Last Completed: ${update.lastCompleted}`);
        console.log(`     Next Due: ${update.nextDue}`);
        console.log(`     Status: ${update.status}\n`);
      }
    }

    console.log('✅ All PM schedules updated successfully!');
    console.log('\nSummary:');
    console.log('  - 1 Overdue (Dec 5 - HVAC Filter)');
    console.log('  - 1 Due Soon (Dec 13 - Hydraulic Pump)');
    console.log('  - 1 Upcoming (Dec 16 - Generator)');
    console.log('  - 1 Future (Dec 25 - HVAC Filter Test)');

  } catch (error) {
    console.error('❌ Error updating PM dates:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

updatePMDates();
