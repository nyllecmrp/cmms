const Database = require('@sqlitecloud/drivers').Database;

const DATABASE_URL = 'sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24';

async function addColumn() {
  console.log('Connecting...');
  const db = new Database(DATABASE_URL);

  try {
    await db.sql`ALTER TABLE AssetPart ADD COLUMN sapNumber TEXT`;
    console.log('✅ Added sapNumber column');

    await db.sql`CREATE INDEX IF NOT EXISTS idx_assetpart_sapnumber ON AssetPart(sapNumber)`;
    console.log('✅ Created index');

    console.log('✨ Done!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addColumn();
