const { Database } = require('@sqlitecloud/drivers');

async function fixPMStatuses() {
  const connectionString = 'sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U';

  console.log('🔌 Connecting to SQLite Cloud...');
  const db = new Database(connectionString);

  try {
    // Get all Acme PM schedules
    const pms = await db.sql("SELECT id, name, nextDue FROM PMSchedule WHERE organizationId = 'org-test-1'");

    console.log(`📊 Fixing status for ${pms.length} PM schedules...\n`);

    const today = new Date('2024-12-11');

    for (const pm of pms) {
      const dueDate = new Date(pm.nextDue);
      const daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let status;
      if (daysDiff < 0) {
        status = 'overdue';
      } else if (daysDiff <= 7) {
        status = 'active'; // Due soon but still active
      } else {
        status = 'active'; // On track
      }

      await db.sql(`
        UPDATE PMSchedule
        SET status = '${status}'
        WHERE id = '${pm.id}'
      `);

      const statusLabel = daysDiff < 0 ? '⚠️ Overdue' : daysDiff <= 7 ? '📅 Due Soon' : '✅ On Track';
      console.log(`  ${statusLabel}: ${pm.name}`);
      console.log(`     Next Due: ${pm.nextDue} (${daysDiff} days from now)`);
      console.log(`     Status set to: ${status}\n`);
    }

    console.log('✅ All PM statuses fixed!');

  } catch (error) {
    console.error('❌ Error fixing PM statuses:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

fixPMStatuses();
