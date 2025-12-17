const { Database } = require('@sqlitecloud/drivers');

async function check() {
  const db = new Database('sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U');

  console.log('📋 ALL Purchase Requests in database:\n');

  const allPRs = await db.sql(`
    SELECT id, requestNumber, title, pmScheduleId, status
    FROM PurchaseRequest
    WHERE organizationId = 'org-test-1'
    ORDER BY requestNumber
  `);

  console.log(`Total PRs: ${allPRs.length}\n`);

  allPRs.forEach(pr => {
    console.log(`${pr.requestNumber} - ${pr.title}`);
    console.log(`  Status: ${pr.status}, PM Link: ${pr.pmScheduleId || 'NONE'}`);
  });

  console.log('\n🔄 Now deleting ALL PRs with pmScheduleId...');

  const result = await db.sql(`
    DELETE FROM PurchaseRequest
    WHERE organizationId = 'org-test-1'
    AND pmScheduleId IS NOT NULL
  `);

  console.log('✅ Deleted all PRs linked to PM schedules');

  process.exit(0);
}

check().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
