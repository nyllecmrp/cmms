const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function fixTable() {
  try {
    // Get column names
    const pragma = await db.sql('PRAGMA table_info(AssetPart_new);');
    const columns = pragma.map(p => p.name).join(', ');
    console.log('Columns:', columns);

    await db.sql(`INSERT INTO AssetPart (${columns}) SELECT ${columns} FROM AssetPart_new;`);
    console.log('✅ Data copied');

    await db.sql('DROP TABLE AssetPart_new;');
    console.log('✅ Cleanup complete');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixTable();
