const { Database } = require('@sqlitecloud/drivers');

async function checkOrgIds() {
  const db = new Database('sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U');

  try {
    // Get all organizations
    const orgs = await db.sql('SELECT id, name FROM Organization');
    console.log(`\n📊 Organizations in database:`);
    orgs.forEach(org => console.log(`  - ${org.id}: ${org.name}`));

    // Get organizationIds from PurchaseOrders
    const poOrgs = await db.sql('SELECT DISTINCT organizationId FROM PurchaseOrder');
    console.log(`\n📦 Organization IDs in PurchaseOrder table:`);
    poOrgs.forEach(po => console.log(`  - ${po.organizationId}`));

    // Check if they match
    const orgIds = orgs.map(o => o.id);
    const poOrgIds = poOrgs.map(po => po.organizationId);

    console.log(`\n🔍 Match check:`);
    poOrgIds.forEach(poOrgId => {
      const match = orgIds.includes(poOrgId);
      console.log(`  ${poOrgId}: ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    db.close();
  }
}

checkOrgIds();
