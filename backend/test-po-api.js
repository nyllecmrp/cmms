const { Database } = require('@sqlitecloud/drivers');

async function testPOAPI() {
  const db = new Database('sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U');

  try {
    // Get an organization ID
    const org = await db.sql('SELECT id FROM Organization LIMIT 1');
    const organizationId = org[0].id;

    console.log(`Testing PO API for organization: ${organizationId}\n`);

    // Test the same query the service uses
    const query = `
      SELECT
        po.*,
        pr.id as pr_id, pr.requestNumber as pr_requestNumber, pr.title as pr_title,
        creator.id as createdBy_id, creator.firstName as createdBy_firstName,
        creator.lastName as createdBy_lastName, creator.email as createdBy_email
      FROM PurchaseOrder po
      LEFT JOIN PurchaseRequest pr ON po.purchaseRequestId = pr.id
      LEFT JOIN User creator ON po.createdById = creator.id
      WHERE po.organizationId = ?
      ORDER BY po.createdAt DESC
    `;

    const orders = await db.sql(query, [organizationId]);
    console.log(`✅ Query returned ${orders.length} purchase orders\n`);

    if (orders.length > 0) {
      console.log('Sample PO data:');
      const sample = orders[0];
      console.log(`  PO Number: ${sample.poNumber}`);
      console.log(`  Supplier: ${sample.supplierName}`);
      console.log(`  Status: ${sample.status}`);
      console.log(`  Total: ${sample.totalCost}`);
      console.log(`  Created By: ${sample.createdBy_firstName} ${sample.createdBy_lastName}`);
      console.log(`\nAll fields available:`, Object.keys(sample));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    db.close();
  }
}

testPOAPI();
