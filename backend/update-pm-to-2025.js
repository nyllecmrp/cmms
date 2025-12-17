const { Database } = require('@sqlitecloud/drivers');

async function updatePMTo2025() {
  const connectionString = 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

  console.log('🔌 Connecting to SQLite Cloud...');
  const db = new Database(connectionString);

  try {
    console.log(`📅 Updating PM schedules to 2025 dates for Acme Manufacturing...\n`);

    // Get today's date to calculate relative dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Calculate dates relative to today
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    const fifteenDaysFromNow = new Date(today);
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Update schedules with relative dates
    const updates = [
      {
        name: 'Weekly Generator Oil Check',
        lastCompleted: yesterday.toISOString().split('T')[0],
        nextDue: fiveDaysFromNow.toISOString().split('T')[0],
        status: 'active'
      },
      {
        name: 'Monthly Hydraulic Pump Inspection',
        lastCompleted: lastMonth.toISOString().split('T')[0],
        nextDue: twoDaysFromNow.toISOString().split('T')[0],
        status: 'active'
      },
      {
        name: 'Quarterly HVAC Filter Replacement',
        lastCompleted: threeMonthsAgo.toISOString().split('T')[0],
        nextDue: twoDaysAgo.toISOString().split('T')[0],
        status: 'overdue'
      },
      {
        name: 'Quarterly HVAC Filter Change',
        lastCompleted: threeMonthsAgo.toISOString().split('T')[0],
        nextDue: fifteenDaysFromNow.toISOString().split('T')[0],
        status: 'active'
      }
    ];

    const pms = await db.sql("SELECT id, name FROM PMSchedule WHERE organizationId = 'org-test-1'");

    for (const pm of pms) {
      // Find matching update (match by first 20 chars to handle variations)
      const update = updates.find(u => pm.name.includes(u.name.substring(0, 20)));

      if (update) {
        await db.sql(`
          UPDATE PMSchedule
          SET lastCompleted = '${update.lastCompleted}',
              nextDue = '${update.nextDue}',
              status = '${update.status}'
          WHERE id = '${pm.id}'
        `);

        const dueDate = new Date(update.nextDue);
        const daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const statusLabel = daysDiff < 0 ? '⚠️ Overdue' : daysDiff <= 7 ? '📅 Due Soon' : '✅ On Track';

        console.log(`  ${statusLabel}: ${pm.name}`);
        console.log(`     Last Completed: ${update.lastCompleted}`);
        console.log(`     Next Due: ${update.nextDue} (${daysDiff} days from now)`);
        console.log(`     Status: ${update.status}\n`);
      }
    }

    console.log('✅ All PM schedules updated with current dates!');
    console.log('\nSummary:');
    console.log('  - 1 Overdue (2 days ago)');
    console.log('  - 1 Due Soon (in 2 days)');
    console.log('  - 1 Upcoming (in 5 days)');
    console.log('  - 1 Future (in 15 days)');

  } catch (error) {
    console.error('❌ Error updating PM dates:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

updatePMTo2025();
