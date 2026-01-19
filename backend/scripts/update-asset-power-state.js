const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function updatePowerStates() {
  console.log('⚡ Updating asset power states to realistic values...\n');

  try {
    // Get all assets
    const assets = await db.sql`SELECT id, assetNumber, name, status FROM Asset`;

    console.log(`Found ${assets.length} assets to update\n`);

    for (const asset of assets) {
      let powerState = 'on';

      // Realistic logic:
      // - Operational machines: mostly ON (80% on, 20% off for breaks/weekends)
      // - Maintenance machines: OFF (being serviced)
      // - Down machines: OFF (broken)

      if (asset.status === 'operational') {
        // 80% chance ON for operational machines
        powerState = Math.random() < 0.8 ? 'on' : 'off';
      } else if (asset.status === 'maintenance' || asset.status === 'down') {
        // Always OFF when under maintenance or down
        powerState = 'off';
      }

      await db.sql`
        UPDATE Asset
        SET powerState = ${powerState}, updatedAt = datetime('now')
        WHERE id = ${asset.id}
      `;

      console.log(`  ✓ ${asset.assetNumber}: ${asset.status} → powerState: ${powerState}`);
    }

    console.log('\n✅ Power states updated successfully!');

  } catch (error) {
    console.error('❌ Error updating power states:', error);
    throw error;
  }
}

updatePowerStates()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
