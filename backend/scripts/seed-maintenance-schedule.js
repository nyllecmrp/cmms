const { Database } = require('@sqlitecloud/drivers');

async function seedMaintenanceSchedule() {
  const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

  try {
    console.log('🌱 Starting maintenance schedule seeding...');

    // Get organization, asset, and parts
    const org = await db.sql`SELECT id FROM Organization LIMIT 1`;
    const organizationId = org[0].id;

    const assets = await db.sql`SELECT id, assetNumber, name FROM Asset`;
    console.log(`Found ${assets.length} assets`);

    const parts = await db.sql`SELECT id, assetId, partNumber, partName, frequencyPM, frequencyAM FROM AssetPart WHERE frequencyPM IS NOT NULL OR frequencyAM IS NOT NULL`;
    console.log(`Found ${parts.length} parts with maintenance frequencies`);

    const currentYear = 2026;
    let scheduleCount = 0;

    // Function to calculate weeks based on frequency
    const getWeeksFromFrequency = (frequency) => {
      if (!frequency) return [];
      const weeks = [];

      if (frequency === '1W') {
        // Every week
        for (let i = 1; i <= 52; i++) weeks.push(i);
      } else if (frequency === '2W') {
        // Every 2 weeks
        for (let i = 1; i <= 52; i += 2) weeks.push(i);
      } else if (frequency === 'M' || frequency === '1M') {
        // Monthly (every 4 weeks)
        for (let i = 1; i <= 52; i += 4) weeks.push(i);
      } else if (frequency === '3M') {
        // Quarterly (every 13 weeks)
        weeks.push(1, 14, 27, 40);
      } else if (frequency === '6M') {
        // Semi-annually (every 26 weeks)
        weeks.push(1, 27);
      } else if (frequency === '12M' || frequency === 'Y') {
        // Annually
        weeks.push(1);
      } else if (frequency === '24M') {
        // Every 2 years (only if current year is even/odd match)
        weeks.push(1);
      }

      return weeks;
    };

    // Generate maintenance schedules for each part
    for (const part of parts) {
      // PM Schedule
      if (part.frequencyPM) {
        const pmWeeks = getWeeksFromFrequency(part.frequencyPM);
        for (const week of pmWeeks) {
          const scheduleId = `sched-${part.id}-${currentYear}-w${week}-PM`;

          await db.sql`
            INSERT OR IGNORE INTO MaintenanceSchedule (
              id, organizationId, assetId, assetPartId, year, weekNumber,
              maintenanceType, partNumber, partName, status, createdAt, updatedAt
            ) VALUES (
              ${scheduleId},
              ${organizationId},
              ${part.assetId},
              ${part.id},
              ${currentYear},
              ${week},
              'PM',
              ${part.partNumber},
              ${part.partName},
              ${week < 3 ? 'completed' : week < 5 ? 'overdue' : 'planned'},
              datetime('now'),
              datetime('now')
            )
          `;
          scheduleCount++;
        }
      }

      // AM Schedule
      if (part.frequencyAM) {
        const amWeeks = getWeeksFromFrequency(part.frequencyAM);
        for (const week of amWeeks) {
          const scheduleId = `sched-${part.id}-${currentYear}-w${week}-AM`;

          await db.sql`
            INSERT OR IGNORE INTO MaintenanceSchedule (
              id, organizationId, assetId, assetPartId, year, weekNumber,
              maintenanceType, partNumber, partName, status, createdAt, updatedAt
            ) VALUES (
              ${scheduleId},
              ${organizationId},
              ${part.assetId},
              ${part.id},
              ${currentYear},
              ${week},
              'AM',
              ${part.partNumber},
              ${part.partName},
              ${week < 3 ? 'completed' : week < 5 ? 'overdue' : 'planned'},
              datetime('now'),
              datetime('now')
            )
          `;
          scheduleCount++;
        }
      }
    }

    console.log(`✅ Successfully seeded ${scheduleCount} maintenance schedule entries for year ${currentYear}`);
    console.log('');

    // Show summary
    const summary = await db.sql`
      SELECT
        maintenanceType,
        status,
        COUNT(*) as count
      FROM MaintenanceSchedule
      WHERE year = ${currentYear}
      GROUP BY maintenanceType, status
      ORDER BY maintenanceType, status
    `;

    console.log('📊 Schedule Summary:');
    console.table(summary);

  } catch (error) {
    console.error('❌ Error seeding maintenance schedule:', error);
    throw error;
  }
}

seedMaintenanceSchedule()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
