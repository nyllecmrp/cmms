const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function addMoreSamples() {
  console.log('🏭 Adding more realistic WCM sample data...\n');

  try {
    const org = await db.sql`SELECT id FROM Organization LIMIT 1`;
    const organizationId = org[0].id;

    const users = await db.sql`SELECT id FROM User LIMIT 1`;
    const userId = users[0]?.id;

    // Add more diverse industrial assets
    const newAssets = [
      {
        id: 'asset-robot-welder-001',
        assetNumber: 'RBT-WLD-001',
        name: 'Robotic Welder - Fanuc ArcMate 100iC',
        manufacturer: 'Fanuc',
        model: 'ArcMate 100iC',
        serialNumber: 'FNC-WLD-2023-4567',
        category: 'Robotics',
        status: 'operational',
        // location: 'Welding Cell 1',
        installationDate: '2023-03-15',
      },
      {
        id: 'asset-laser-cutter-001',
        assetNumber: 'LSR-CUT-001',
        name: 'Laser Cutting Machine - Trumpf TruLaser 3030',
        manufacturer: 'Trumpf',
        model: 'TruLaser 3030',
        serialNumber: 'TRF-LSR-2022-8901',
        category: 'Cutting Equipment',
        status: 'operational',
        // location: 'Fabrication Area',
        installationDate: '2022-11-20',
      },
      {
        id: 'asset-injection-mold-001',
        assetNumber: 'INJ-MLD-001',
        name: 'Injection Molding Machine - Engel e-victory 200',
        manufacturer: 'Engel',
        model: 'e-victory 200',
        serialNumber: 'ENG-INJ-2021-3344',
        category: 'Molding',
        status: 'operational',
        // location: 'Molding Department',
        installationDate: '2021-08-10',
      },
      {
        id: 'asset-grinder-001',
        assetNumber: 'GRD-001',
        name: 'Surface Grinder - Okamoto ACC-1224DX',
        manufacturer: 'Okamoto',
        model: 'ACC-1224DX',
        serialNumber: 'OKA-GRD-2020-5678',
        category: 'Grinding',
        status: 'operational',
        // location: 'Precision Machining',
        installationDate: '2020-05-25',
      },
    ];

    console.log('🏗️  Creating new assets...');
    for (const asset of newAssets) {
      await db.sql`
        INSERT OR IGNORE INTO Asset (
          id, organizationId, assetNumber, name, manufacturer, model,
          serialNumber, category, status, installationDate,
          createdById, createdAt, updatedAt
        ) VALUES (
          ${asset.id}, ${organizationId}, ${asset.assetNumber}, ${asset.name},
          ${asset.manufacturer}, ${asset.model}, ${asset.serialNumber},
          ${asset.category}, ${asset.status},
          ${asset.installationDate}, ${userId || null},
          datetime('now'), datetime('now')
        )
      `;
    }
    console.log(`  ✅ Created ${newAssets.length} new assets\n`);

    // Add parts for each asset
    const assetParts = [
      // Robotic Welder Parts
      {
        assetId: 'asset-robot-welder-001',
        parts: [
          {
            id: 'part-robot-servo-j1',
            partNumber: 'FNC-SRV-J1-200',
            partName: 'J1 Joint Servo Motor',
            sapNumber: 'SAP-300111',
            componentClassification: 'Critical',
            pmType: 'PM',
            smpNumber: 301,
            frequencyPM: '12M',
            maintenanceTimeMinutes: 240,
            frequencyAM: 'M',
            notes: 'Base rotation servo motor - critical for positioning',
          },
          {
            id: 'part-robot-torch',
            partNumber: 'WLD-TCH-500A',
            partName: 'Welding Torch Assembly',
            sapNumber: 'SAP-300222',
            componentClassification: 'Critical',
            pmType: 'PM',
            smpNumber: 302,
            frequencyPM: '3M',
            maintenanceTimeMinutes: 120,
            frequencyAM: '2W',
            notes: 'MIG welding torch with contact tips',
          },
          {
            id: 'part-robot-wire-feeder',
            partNumber: 'WLD-FDR-350',
            partName: 'Wire Feeder Unit',
            sapNumber: 'SAP-300333',
            componentClassification: 'Important',
            pmType: 'PM',
            smpNumber: 303,
            frequencyPM: '6M',
            maintenanceTimeMinutes: 90,
            frequencyAM: '1W',
            notes: 'Automatic wire feeding mechanism',
          },
        ],
      },
      // Laser Cutter Parts
      {
        assetId: 'asset-laser-cutter-001',
        parts: [
          {
            id: 'part-laser-resonator',
            partNumber: 'TRF-RES-3000W',
            partName: 'CO2 Laser Resonator',
            sapNumber: 'SAP-400111',
            componentClassification: 'Critical',
            pmType: 'PM',
            smpNumber: 401,
            frequencyPM: '12M',
            maintenanceTimeMinutes: 480,
            frequencyAM: 'M',
            notes: '3000W CO2 laser source - requires clean room',
          },
          {
            id: 'part-laser-lens',
            partNumber: 'TRF-LNS-125',
            partName: 'Focusing Lens Assembly',
            sapNumber: 'SAP-400222',
            componentClassification: 'Critical',
            pmType: 'PM',
            smpNumber: 402,
            frequencyPM: '3M',
            maintenanceTimeMinutes: 60,
            frequencyAM: '1W',
            notes: 'Precision optics - handle with extreme care',
          },
          {
            id: 'part-laser-chiller',
            partNumber: 'CHL-5000-IND',
            partName: 'Water Chiller Unit',
            sapNumber: 'SAP-400333',
            componentClassification: 'Critical',
            pmType: 'PM',
            smpNumber: 403,
            frequencyPM: '6M',
            maintenanceTimeMinutes: 150,
            frequencyAM: '2W',
            notes: 'Cooling system for laser resonator',
          },
          {
            id: 'part-laser-nozzle',
            partNumber: 'TRF-NZL-1.5',
            partName: 'Cutting Nozzle',
            sapNumber: 'SAP-400444',
            componentClassification: 'Important',
            pmType: 'PM',
            smpNumber: 404,
            frequencyPM: 'M',
            maintenanceTimeMinutes: 30,
            frequencyAM: '1W',
            notes: 'Consumable - replace when damaged',
          },
        ],
      },
      // Injection Molding Machine Parts
      {
        assetId: 'asset-injection-mold-001',
        parts: [
          {
            id: 'part-inj-screw',
            partNumber: 'ENG-SCW-45MM',
            partName: 'Injection Screw',
            sapNumber: 'SAP-500111',
            componentClassification: 'Critical',
            pmType: 'PM',
            smpNumber: 501,
            frequencyPM: '12M',
            maintenanceTimeMinutes: 360,
            frequencyAM: 'M',
            notes: '45mm diameter - wear measurement required',
          },
          {
            id: 'part-inj-heaters',
            partNumber: 'ENG-HTR-BAND-5Z',
            partName: 'Barrel Heater Bands',
            sapNumber: 'SAP-500222',
            componentClassification: 'Critical',
            pmType: 'PM',
            smpNumber: 502,
            frequencyPM: '6M',
            maintenanceTimeMinutes: 180,
            frequencyAM: 'M',
            notes: '5-zone heating system',
          },
          {
            id: 'part-inj-hydraulic',
            partNumber: 'HYD-PMP-200CC',
            partName: 'Hydraulic Pump',
            sapNumber: 'SAP-500333',
            componentClassification: 'Critical',
            pmType: 'PM',
            smpNumber: 503,
            frequencyPM: '6M',
            maintenanceTimeMinutes: 240,
            frequencyAM: '2W',
            notes: 'Variable displacement pump - 200cc',
          },
        ],
      },
      // Surface Grinder Parts
      {
        assetId: 'asset-grinder-001',
        parts: [
          {
            id: 'part-grind-spindle',
            partNumber: 'OKA-SPN-12K',
            partName: 'Grinding Spindle',
            sapNumber: 'SAP-600111',
            componentClassification: 'Critical',
            pmType: 'PM',
            smpNumber: 601,
            frequencyPM: '12M',
            maintenanceTimeMinutes: 300,
            frequencyAM: 'M',
            notes: '12000 RPM precision spindle',
          },
          {
            id: 'part-grind-wheel',
            partNumber: 'GRW-AL2O3-12X1',
            partName: 'Grinding Wheel',
            sapNumber: 'SAP-600222',
            componentClassification: 'Important',
            pmType: 'PM',
            smpNumber: 602,
            frequencyPM: '3M',
            maintenanceTimeMinutes: 120,
            frequencyAM: '1W',
            notes: 'Aluminum oxide wheel - dress regularly',
          },
          {
            id: 'part-grind-coolant-pump',
            partNumber: 'CLP-500-IND',
            partName: 'Coolant Pump System',
            sapNumber: 'SAP-600333',
            componentClassification: 'Important',
            pmType: 'PM',
            smpNumber: 603,
            frequencyPM: '6M',
            maintenanceTimeMinutes: 90,
            frequencyAM: '2W',
            notes: 'High-pressure coolant delivery',
          },
        ],
      },
    ];

    console.log('🔩 Creating parts for each asset...');
    let totalPartsCreated = 0;

    for (const assetGroup of assetParts) {
      for (const part of assetGroup.parts) {
        await db.sql`
          INSERT OR IGNORE INTO AssetPart (
            id, assetId, partNumber, partName, sapNumber,
            componentClassification, pmType, smpNumber,
            frequencyPM, maintenanceTimeMinutes, frequencyAM, notes,
            createdAt, updatedAt
          ) VALUES (
            ${part.id}, ${assetGroup.assetId}, ${part.partNumber}, ${part.partName},
            ${part.sapNumber}, ${part.componentClassification}, ${part.pmType},
            ${part.smpNumber}, ${part.frequencyPM}, ${part.maintenanceTimeMinutes},
            ${part.frequencyAM}, ${part.notes},
            datetime('now'), datetime('now')
          )
        `;
        totalPartsCreated++;
      }
    }

    console.log(`  ✅ Created ${totalPartsCreated} parts\n`);

    // Generate maintenance schedules
    console.log('📅 Generating maintenance schedules...');

    const getWeeksFromFrequency = (frequency) => {
      if (!frequency) return [];
      const weeks = [];

      if (frequency === '1W') {
        for (let i = 1; i <= 52; i++) weeks.push(i);
      } else if (frequency === '2W') {
        for (let i = 1; i <= 52; i += 2) weeks.push(i);
      } else if (frequency === 'M' || frequency === '1M') {
        for (let i = 1; i <= 52; i += 4) weeks.push(i);
      } else if (frequency === '3M') {
        weeks.push(1, 14, 27, 40);
      } else if (frequency === '6M') {
        weeks.push(1, 27);
      } else if (frequency === '12M' || frequency === 'Y') {
        weeks.push(1);
      }

      return weeks;
    };

    const allParts = await db.sql`
      SELECT id, assetId, partNumber, partName, frequencyPM, frequencyAM
      FROM AssetPart
      WHERE assetId IN (
        'asset-robot-welder-001',
        'asset-laser-cutter-001',
        'asset-injection-mold-001',
        'asset-grinder-001'
      )
    `;

    let scheduleCount = 0;
    const currentYear = 2026;

    for (const part of allParts) {
      // PM Schedules
      if (part.frequencyPM) {
        const pmWeeks = getWeeksFromFrequency(part.frequencyPM);
        for (const week of pmWeeks) {
          const scheduleId = `sched-${part.id}-${currentYear}-w${week}-PM`;

          // Randomly set status based on week
          let status = 'planned';
          if (week <= 2) status = 'completed';
          else if (week === 3 || week === 4) status = 'overdue';

          await db.sql`
            INSERT OR IGNORE INTO MaintenanceSchedule (
              id, organizationId, assetId, assetPartId, year, weekNumber,
              maintenanceType, partNumber, partName, status, createdAt, updatedAt
            ) VALUES (
              ${scheduleId}, ${organizationId}, ${part.assetId}, ${part.id},
              ${currentYear}, ${week}, 'PM', ${part.partNumber}, ${part.partName},
              ${status}, datetime('now'), datetime('now')
            )
          `;
          scheduleCount++;
        }
      }

      // AM Schedules
      if (part.frequencyAM) {
        const amWeeks = getWeeksFromFrequency(part.frequencyAM);
        for (const week of amWeeks) {
          const scheduleId = `sched-${part.id}-${currentYear}-w${week}-AM`;

          let status = 'planned';
          if (week <= 2) status = 'completed';
          else if (week === 3 || week === 4) status = 'overdue';

          await db.sql`
            INSERT OR IGNORE INTO MaintenanceSchedule (
              id, organizationId, assetId, assetPartId, year, weekNumber,
              maintenanceType, partNumber, partName, status, createdAt, updatedAt
            ) VALUES (
              ${scheduleId}, ${organizationId}, ${part.assetId}, ${part.id},
              ${currentYear}, ${week}, 'AM', ${part.partNumber}, ${part.partName},
              ${status}, datetime('now'), datetime('now')
            )
          `;
          scheduleCount++;
        }
      }
    }

    console.log(`  ✅ Generated ${scheduleCount} maintenance schedules\n`);

    // Final summary
    console.log('📊 FINAL SUMMARY:');
    const summary = await db.sql`
      SELECT
        a.assetNumber,
        a.name,
        COUNT(DISTINCT ap.id) as parts,
        COUNT(DISTINCT ms.id) as schedules
      FROM Asset a
      LEFT JOIN AssetPart ap ON a.id = ap.assetId
      LEFT JOIN MaintenanceSchedule ms ON a.id = ms.assetId AND ms.year = 2026
      WHERE a.id IN (
        'asset-robot-welder-001',
        'asset-laser-cutter-001',
        'asset-injection-mold-001',
        'asset-grinder-001',
        'asset-cnc-mill-001',
        'asset-press-003'
      )
      GROUP BY a.id
      ORDER BY parts DESC
    `;

    console.table(summary);

    console.log('\n✅ Successfully added diverse WCM sample data!');
    console.log('\nAssets now include:');
    console.log('  • Robotic Welding Equipment');
    console.log('  • Laser Cutting Machinery');
    console.log('  • Injection Molding Systems');
    console.log('  • Precision Grinding Equipment');
    console.log('  • CNC Machining Centers');
    console.log('  • Hydraulic Press Systems\n');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    throw error;
  }
}

addMoreSamples()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
