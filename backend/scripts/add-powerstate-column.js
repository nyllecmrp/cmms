const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function addPowerStateColumn() {
  console.log('⚡ Adding powerState column to Asset table...\n');

  try {
    // Add powerState column to Asset table
    await db.sql`
      ALTER TABLE Asset
      ADD COLUMN powerState TEXT
    `;

    console.log('✅ Column added successfully!');

    // Now update with realistic values
    const assets = await db.sql`SELECT id, assetNumber, name, status FROM Asset`;

    console.log(`\n⚡ Updating ${assets.length} assets with realistic power states...\n`);

    for (const asset of assets) {
      let powerState = 'on';

      // Realistic logic:
      // - Operational machines: mostly ON (80% on, 20% off for breaks/weekends)
      // - Maintenance machines: OFF (being serviced)
      // - Down machines: OFF (broken)

      if (asset.status === 'operational') {
        powerState = Math.random() < 0.8 ? 'on' : 'off';
      } else if (asset.status === 'maintenance' || asset.status === 'down') {
        powerState = 'off';
      }

      await db.sql`
        UPDATE Asset
        SET powerState = ${powerState}
        WHERE id = ${asset.id}
      `;

      console.log(`  ✓ ${asset.assetNumber}: ${asset.status} → powerState: ${powerState}`);
    }

    console.log('\n✅ All power states updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

addPowerStateColumn()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
