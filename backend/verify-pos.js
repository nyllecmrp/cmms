const { Database } = require('@sqlitecloud/drivers');

async function verifyPOs() {
  const db = new Database('sqlitecloud://cplhmmjenz.g6.sqlite.cloud:8860/my-database-cmms?apikey=JiY9bOt3Avwnzj9u01AyGNawuecsRJ9EjYqbRsYqZ4U');

  try {
    const pos = await db.sql('SELECT poNumber, supplierName, status, totalCost FROM PurchaseOrder ORDER BY poNumber');
    console.log(`✅ Found ${pos.length} Purchase Orders in database:\n`);

    pos.forEach(po => {
      console.log(`  ${po.poNumber}: ${po.supplierName}`);
      console.log(`    Status: ${po.status} | Total: ₱${po.totalCost.toLocaleString('en-PH')}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    db.close();
  }
}

verifyPOs();
