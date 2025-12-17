const { Database } = require('@sqlitecloud/drivers');

async function cleanup() {
  const db = new Database('sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U');

  console.log('🔍 Checking for orphaned Purchase Requests...\n');

  // Get all PRs with pmScheduleId
  const prs = await db.sql(`
    SELECT pr.id, pr.requestNumber, pr.title, pr.pmScheduleId
    FROM PurchaseRequest pr
    WHERE pr.organizationId = 'org-test-1'
    AND pr.pmScheduleId IS NOT NULL
  `);

  console.log(`Found ${prs.length} PRs linked to PM schedules\n`);

  // Check which PM schedules still exist
  const pmIds = prs.map(pr => pr.pmScheduleId);
  const uniquePmIds = [...new Set(pmIds)];

  console.log('Checking PM schedules...');
  const existingPMs = await db.sql(`
    SELECT id, name FROM PMSchedule
    WHERE id IN (${uniquePmIds.map(() => '?').join(',')})
  `, uniquePmIds);

  const existingPmIds = new Set(existingPMs.map(pm => pm.id));

  console.log(`  - ${existingPMs.length} PM schedules still exist`);
  existingPMs.forEach(pm => console.log(`    ✓ ${pm.name}`));

  // Find orphaned PRs
  const orphanedPRs = prs.filter(pr => !existingPmIds.has(pr.pmScheduleId));

  if (orphanedPRs.length === 0) {
    console.log('\n✅ No orphaned PRs found!');
    process.exit(0);
  }

  console.log(`\n❌ Found ${orphanedPRs.length} orphaned PRs:`);
  orphanedPRs.forEach(pr => console.log(`  - ${pr.requestNumber}: ${pr.title}`));

  // Delete orphaned PRs
  console.log('\n🗑️  Deleting orphaned PRs...');
  await db.sql(`
    DELETE FROM PurchaseRequest
    WHERE organizationId = 'org-test-1'
    AND pmScheduleId IS NOT NULL
    AND pmScheduleId NOT IN (SELECT id FROM PMSchedule)
  `);

  console.log('✅ Cleanup complete!');
  process.exit(0);
}

cleanup().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
