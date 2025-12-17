const { Database } = require('@sqlitecloud/drivers');

async function deleteOrphans() {
  const db = new Database('sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U');

  console.log('🗑️  Deleting orphaned PRs (created from deleted PM schedules)...\n');

  // Delete PRs that start with "Parts for PM:" but have no pmScheduleId link
  const result = await db.sql(`
    DELETE FROM PurchaseRequest
    WHERE organizationId = 'org-test-1'
    AND title LIKE 'Parts for PM:%'
    AND pmScheduleId IS NULL
  `);

  console.log('✅ Deleted orphaned PRs');
  console.log('Refresh the procurement page now.');

  process.exit(0);
}

deleteOrphans().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
