const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function improveSampleData() {
  console.log('🔧 Improving sample data for realistic WCM scenario...\n');

  try {
    // Get organization
    const org = await db.sql`SELECT id FROM Organization LIMIT 1`;
    const organizationId = org[0].id;

    // Get user for completed tasks
    const users = await db.sql`SELECT id FROM User LIMIT 1`;
    const userId = users[0]?.id;

    // Update some schedules to have realistic completion data
    console.log('📅 Adding realistic completion data to schedules...');

    // Mark weeks 1-2 as completed with dates
    await db.sql`
      UPDATE MaintenanceSchedule
      SET status = 'completed',
          completedAt = datetime('2026-01-' || CAST((weekNumber * 7) AS TEXT), '-' || CAST(RANDOM() % 3 AS TEXT) || ' days'),
          completedById = ${userId || null}
      WHERE year = 2026 AND weekNumber IN (1, 2) AND status != 'completed'
    `;

    // Mark weeks 3-4 as overdue
    await db.sql`
      UPDATE MaintenanceSchedule
      SET status = 'overdue'
      WHERE year = 2026 AND weekNumber IN (3, 4) AND status = 'planned'
    `;

    // Add realistic notes to some completed tasks
    const completedTasks = await db.sql`
      SELECT id FROM MaintenanceSchedule
      WHERE status = 'completed' AND notes IS NULL
      LIMIT 10
    `;

    const sampleNotes = [
      'Completed during morning shift. All parameters within spec.',
      'Replaced worn components. System running smoothly.',
      'Inspection complete. Minor wear detected, monitoring.',
      'Preventive maintenance completed successfully.',
      'All checks passed. No issues found.',
      'Lubrication applied. Temperature readings normal.',
      'Visual inspection complete. Component condition good.',
      'Cleaned and inspected. No abnormalities detected.',
    ];

    for (const task of completedTasks) {
      const note = sampleNotes[Math.floor(Math.random() * sampleNotes.length)];
      await db.sql`
        UPDATE MaintenanceSchedule
        SET notes = ${note}
        WHERE id = ${task.id}
      `;
    }

    console.log('✅ Updated maintenance schedules with realistic data');

    // Add more parts to existing assets to make it more realistic
    console.log('\n🔩 Adding additional parts to assets...');

    const cncAsset = await db.sql`SELECT id FROM Asset WHERE assetNumber = 'CNC-001' AND name = 'CNC Milling Machine - Haas VF-4' LIMIT 1`;
    const pressAsset = await db.sql`SELECT id FROM Asset WHERE assetNumber = 'HPR-003' LIMIT 1`;

    if (cncAsset.length > 0) {
      const additionalCNCParts = [
        {
          id: 'part-cnc-servo-x',
          assetId: cncAsset[0].id,
          partNumber: 'SRV-X-AXIS',
          partName: 'X-Axis Servo Motor',
          sapNumber: 'SAP-100567',
          componentClassification: 'Critical',
          pmType: 'PM',
          smpNumber: 105,
          frequencyPM: '12M',
          maintenanceTimeMinutes: 180,
          frequencyAM: 'M',
          notes: 'High-precision servo motor for X-axis movement',
        },
        {
          id: 'part-cnc-atc',
          assetId: cncAsset[0].id,
          partNumber: 'ATC-20-CAP',
          partName: 'Automatic Tool Changer',
          sapNumber: 'SAP-100789',
          componentClassification: 'Critical',
          pmType: 'PM',
          smpNumber: 106,
          frequencyPM: '6M',
          maintenanceTimeMinutes: 120,
          frequencyAM: 'M',
          notes: '20-position tool changer mechanism',
        },
      ];

      for (const part of additionalCNCParts) {
        await db.sql`
          INSERT OR IGNORE INTO AssetPart (
            id, assetId, partNumber, partName, sapNumber,
            componentClassification, pmType, smpNumber,
            frequencyPM, maintenanceTimeMinutes, frequencyAM, notes,
            createdAt, updatedAt
          ) VALUES (
            ${part.id}, ${part.assetId}, ${part.partNumber}, ${part.partName},
            ${part.sapNumber}, ${part.componentClassification}, ${part.pmType},
            ${part.smpNumber}, ${part.frequencyPM}, ${part.maintenanceTimeMinutes},
            ${part.frequencyAM}, ${part.notes},
            datetime('now'), datetime('now')
          )
        `;
      }

      console.log('  ✅ Added 2 more parts to CNC machine');
    }

    if (pressAsset.length > 0) {
      const additionalPressParts = [
        {
          id: 'part-press-filter',
          assetId: pressAsset[0].id,
          partNumber: 'HYF-100-RETURN',
          partName: 'Hydraulic Return Filter',
          sapNumber: 'SAP-200456',
          componentClassification: 'Important',
          pmType: 'PM',
          smpNumber: 204,
          frequencyPM: '3M',
          maintenanceTimeMinutes: 60,
          frequencyAM: 'M',
          notes: 'Return line filtration system',
        },
      ];

      for (const part of additionalPressParts) {
        await db.sql`
          INSERT OR IGNORE INTO AssetPart (
            id, assetId, partNumber, partName, sapNumber,
            componentClassification, pmType, smpNumber,
            frequencyPM, maintenanceTimeMinutes, frequencyAM, notes,
            createdAt, updatedAt
          ) VALUES (
            ${part.id}, ${part.assetId}, ${part.partNumber}, ${part.partName},
            ${part.sapNumber}, ${part.componentClassification}, ${part.pmType},
            ${part.smpNumber}, ${part.frequencyPM}, ${part.maintenanceTimeMinutes},
            ${part.frequencyAM}, ${part.notes},
            datetime('now'), datetime('now')
          )
        `;
      }

      console.log('  ✅ Added 1 more part to Hydraulic Press');
    }

    // Generate schedules for new parts
    console.log('\n📊 Generating schedules for new parts...');

    const getWeeksFromFrequency = (frequency) => {
      if (!frequency) return [];
      const weeks = [];

      if (frequency === '1W') {
        for (let i = 1; i <= 52; i++) weeks.push(i);
      } else if (frequency === 'M' || frequency === '1M') {
        for (let i = 1; i <= 52; i += 4) weeks.push(i);
      } else if (frequency === '3M') {
        weeks.push(1, 14, 27, 40);
      } else if (frequency === '6M') {
        weeks.push(1, 27);
      } else if (frequency === '12M') {
        weeks.push(1);
      }

      return weeks;
    };

    const newParts = await db.sql`
      SELECT id, assetId, partNumber, partName, frequencyPM, frequencyAM
      FROM AssetPart
      WHERE id IN ('part-cnc-servo-x', 'part-cnc-atc', 'part-press-filter')
    `;

    let newScheduleCount = 0;
    const currentYear = 2026;

    for (const part of newParts) {
      if (part.frequencyPM) {
        const pmWeeks = getWeeksFromFrequency(part.frequencyPM);
        for (const week of pmWeeks) {
          const scheduleId = `sched-${part.id}-${currentYear}-w${week}-PM`;
          await db.sql`
            INSERT OR IGNORE INTO MaintenanceSchedule (
              id, organizationId, assetId, assetPartId, year, weekNumber,
              maintenanceType, partNumber, partName, status, createdAt, updatedAt
            ) VALUES (
              ${scheduleId}, ${organizationId}, ${part.assetId}, ${part.id},
              ${currentYear}, ${week}, 'PM', ${part.partNumber}, ${part.partName},
              ${week < 3 ? 'completed' : week < 5 ? 'overdue' : 'planned'},
              datetime('now'), datetime('now')
            )
          `;
          newScheduleCount++;
        }
      }

      if (part.frequencyAM) {
        const amWeeks = getWeeksFromFrequency(part.frequencyAM);
        for (const week of amWeeks) {
          const scheduleId = `sched-${part.id}-${currentYear}-w${week}-AM`;
          await db.sql`
            INSERT OR IGNORE INTO MaintenanceSchedule (
              id, organizationId, assetId, assetPartId, year, weekNumber,
              maintenanceType, partNumber, partName, status, createdAt, updatedAt
            ) VALUES (
              ${scheduleId}, ${organizationId}, ${part.assetId}, ${part.id},
              ${currentYear}, ${week}, 'AM', ${part.partNumber}, ${part.partName},
              ${week < 3 ? 'completed' : week < 5 ? 'overdue' : 'planned'},
              datetime('now'), datetime('now')
            )
          `;
          newScheduleCount++;
        }
      }
    }

    console.log(`  ✅ Generated ${newScheduleCount} new maintenance schedules`);

    // Final summary
    console.log('\n📋 FINAL DATA SUMMARY:');

    const summary = await db.sql`
      SELECT
        a.assetNumber,
        a.name,
        COUNT(DISTINCT ap.id) as partCount,
        COUNT(DISTINCT ms.id) as scheduleCount
      FROM Asset a
      LEFT JOIN AssetPart ap ON a.id = ap.assetId
      LEFT JOIN MaintenanceSchedule ms ON a.id = ms.assetId AND ms.year = 2026
      WHERE a.assetNumber IN ('CNC-001', 'HPR-003')
      GROUP BY a.id
      ORDER BY partCount DESC
    `;

    console.table(summary);

    console.log('\n✅ Sample data improvement complete!');

  } catch (error) {
    console.error('❌ Error improving sample data:', error);
    throw error;
  }
}

improveSampleData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
