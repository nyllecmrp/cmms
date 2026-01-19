const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function seedWCMData() {
  console.log('🌱 Starting WCM sample data seeding...\n');

  try {
    // 1. Create sample assets (industrial machines)
    console.log('📦 Creating sample assets...');
    const assets = [
      {
        id: 'asset-cnc-mill-001',
        name: 'CNC Milling Machine - Haas VF-4',
        assetNumber: 'CNC-001',
        category: 'Machining',
        locationId: 'loc-factory-floor',
        organizationId: 'org-test-1',
        status: 'operational',
        purchaseDate: '2020-03-15',
        installationDate: '2020-04-01',
        manufacturer: 'Haas Automation',
        model: 'VF-4',
        serialNumber: 'HAS-VF4-2020-12345',
        createdById: 'e928d83699a68e18fa0f85374c7f1ca47',
      },
      {
        id: 'asset-lathe-002',
        name: 'CNC Lathe - Okuma LB3000',
        assetNumber: 'LAT-002',
        category: 'Machining',
        locationId: 'loc-factory-floor',
        organizationId: 'org-test-1',
        status: 'operational',
        purchaseDate: '2019-08-20',
        installationDate: '2019-09-10',
        manufacturer: 'Okuma',
        model: 'LB3000',
        serialNumber: 'OKU-LB3000-2019-67890',
        createdById: 'e928d83699a68e18fa0f85374c7f1ca47',
      },
      {
        id: 'asset-press-003',
        name: 'Hydraulic Press - 500 Ton',
        assetNumber: 'HPR-003',
        category: 'Forming',
        locationId: 'loc-assembly-area',
        organizationId: 'org-test-1',
        status: 'operational',
        purchaseDate: '2018-11-05',
        installationDate: '2018-12-15',
        manufacturer: 'Schuler',
        model: 'HP-500',
        serialNumber: 'SCH-HP500-2018-11223',
        createdById: 'e928d83699a68e18fa0f85374c7f1ca47',
      },
      {
        id: 'asset-welder-004',
        name: 'Robotic Welder - ABB IRB 1600',
        assetNumber: 'WLD-004',
        category: 'Welding',
        locationId: 'loc-assembly-area',
        organizationId: 'org-test-1',
        status: 'operational',
        purchaseDate: '2021-06-10',
        installationDate: '2021-07-20',
        manufacturer: 'ABB Robotics',
        model: 'IRB 1600',
        serialNumber: 'ABB-IRB1600-2021-44556',
        createdById: 'e928d83699a68e18fa0f85374c7f1ca47',
      },
    ];

    for (const asset of assets) {
      await db.sql`INSERT OR REPLACE INTO Asset (id, name, assetNumber, category, locationId, organizationId, status, purchaseDate, installationDate, manufacturer, model, serialNumber, createdById, createdAt, updatedAt)
        VALUES (${asset.id}, ${asset.name}, ${asset.assetNumber}, ${asset.category}, ${asset.locationId}, ${asset.organizationId}, ${asset.status}, ${asset.purchaseDate}, ${asset.installationDate}, ${asset.manufacturer}, ${asset.model}, ${asset.serialNumber}, ${asset.createdById}, datetime('now'), datetime('now'))`;
      console.log(`  ✓ Created asset: ${asset.name}`);
    }

    // 2. Create WCM parts for CNC Milling Machine
    console.log('\n🔧 Creating WCM parts for CNC Milling Machine...');
    const cncParts = [
      {
        id: 'part-cnc-spindle',
        assetId: 'asset-cnc-mill-001',
        partNumber: 'SPD-8000-A',
        partName: 'Main Spindle Assembly',
        sapNumber: 'SAP-100234',
        componentClassification: 'Critical',
        pmType: 'PM',
        smpNumber: 101,
        frequencyPM: '3M',
        maintenanceTimeMinutes: 240,
        frequencyAM: '1W',
        autonomousTimeMinutes: 15,
        frequencyQM: '6M',
        qualityTimeMinutes: 120,
        frequencyGM: 'M',
        generalTimeMinutes: 30,
        estimatedCostPM: 850.00,
        estimatedCostAM: 25.00,
        estimatedCostQM: 450.00,
        estimatedCostGM: 75.00,
        notes: 'Critical component - requires certified technician',
      },
      {
        id: 'part-cnc-coolant-pump',
        assetId: 'asset-cnc-mill-001',
        partNumber: 'CPP-2500-B',
        partName: 'Coolant Pump',
        sapNumber: 'SAP-100567',
        componentClassification: 'Important',
        pmType: 'PM',
        smpNumber: 102,
        frequencyPM: '6M',
        maintenanceTimeMinutes: 90,
        frequencyAM: '2W',
        autonomousTimeMinutes: 10,
        frequencyQM: '12M',
        qualityTimeMinutes: 60,
        frequencyGM: '3M',
        generalTimeMinutes: 20,
        estimatedCostPM: 320.00,
        estimatedCostAM: 15.00,
        estimatedCostQM: 180.00,
        estimatedCostGM: 45.00,
        notes: 'Check coolant levels and filter condition',
      },
      {
        id: 'part-cnc-ball-screw',
        assetId: 'asset-cnc-mill-001',
        partNumber: 'BSC-4040-X',
        partName: 'X-Axis Ball Screw',
        sapNumber: 'SAP-101234',
        componentClassification: 'Critical',
        pmType: 'PM',
        smpNumber: 103,
        frequencyPM: '12M',
        maintenanceTimeMinutes: 180,
        frequencyAM: 'M',
        autonomousTimeMinutes: 20,
        frequencyQM: '6M',
        qualityTimeMinutes: 90,
        frequencyGM: '3M',
        generalTimeMinutes: 25,
        estimatedCostPM: 1200.00,
        estimatedCostAM: 30.00,
        estimatedCostQM: 250.00,
        estimatedCostGM: 60.00,
        notes: 'Lubrication and backlash measurement required',
      },
      {
        id: 'part-cnc-servo-motor',
        assetId: 'asset-cnc-mill-001',
        partNumber: 'SVM-750-Y',
        partName: 'Y-Axis Servo Motor',
        sapNumber: 'SAP-102456',
        componentClassification: 'Critical',
        pmType: 'PM',
        smpNumber: 104,
        frequencyPM: '6M',
        maintenanceTimeMinutes: 120,
        frequencyAM: 'M',
        autonomousTimeMinutes: 15,
        frequencyQM: '12M',
        qualityTimeMinutes: 90,
        frequencyGM: '3M',
        generalTimeMinutes: 30,
        estimatedCostPM: 680.00,
        estimatedCostAM: 20.00,
        estimatedCostQM: 320.00,
        estimatedCostGM: 55.00,
        notes: 'Check encoder feedback and thermal sensors',
      },
      {
        id: 'part-cnc-tool-changer',
        assetId: 'asset-cnc-mill-001',
        partNumber: 'ATC-24-PRO',
        partName: 'Automatic Tool Changer',
        sapNumber: 'SAP-103789',
        componentClassification: 'Important',
        pmType: 'PM',
        smpNumber: 105,
        frequencyPM: '3M',
        maintenanceTimeMinutes: 60,
        frequencyAM: '1W',
        autonomousTimeMinutes: 10,
        frequencyQM: '6M',
        qualityTimeMinutes: 45,
        frequencyGM: 'M',
        generalTimeMinutes: 15,
        estimatedCostPM: 280.00,
        estimatedCostAM: 12.00,
        estimatedCostQM: 150.00,
        estimatedCostGM: 35.00,
        notes: 'Inspect tool grippers and carousel alignment',
      },
    ];

    for (const part of cncParts) {
      await db.sql`INSERT OR REPLACE INTO AssetPart (
        id, assetId, partNumber, partName, sapNumber, componentClassification,
        pmType, smpNumber, frequencyPM, maintenanceTimeMinutes,
        frequencyAM, autonomousTimeMinutes, frequencyQM, qualityTimeMinutes,
        frequencyGM, generalTimeMinutes, estimatedCostPM, estimatedCostAM,
        estimatedCostQM, estimatedCostGM, notes, createdAt, updatedAt
      ) VALUES (
        ${part.id}, ${part.assetId}, ${part.partNumber}, ${part.partName},
        ${part.sapNumber}, ${part.componentClassification}, ${part.pmType},
        ${part.smpNumber}, ${part.frequencyPM}, ${part.maintenanceTimeMinutes},
        ${part.frequencyAM}, ${part.autonomousTimeMinutes}, ${part.frequencyQM},
        ${part.qualityTimeMinutes}, ${part.frequencyGM}, ${part.generalTimeMinutes},
        ${part.estimatedCostPM}, ${part.estimatedCostAM}, ${part.estimatedCostQM},
        ${part.estimatedCostGM}, ${part.notes}, datetime('now'), datetime('now')
      )`;
      console.log(`  ✓ Created part: ${part.partName}`);
    }

    // 3. Create WCM parts for Hydraulic Press
    console.log('\n🔧 Creating WCM parts for Hydraulic Press...');
    const pressParts = [
      {
        id: 'part-press-hydraulic-cylinder',
        assetId: 'asset-press-003',
        partNumber: 'HYC-500T-MAIN',
        partName: 'Main Hydraulic Cylinder',
        sapNumber: 'SAP-200123',
        componentClassification: 'Critical',
        pmType: 'PM',
        smpNumber: 201,
        frequencyPM: '3M',
        maintenanceTimeMinutes: 180,
        frequencyAM: '1W',
        autonomousTimeMinutes: 20,
        frequencyQM: '6M',
        qualityTimeMinutes: 120,
        frequencyGM: 'M',
        generalTimeMinutes: 35,
        estimatedCostPM: 950.00,
        estimatedCostAM: 30.00,
        estimatedCostQM: 480.00,
        estimatedCostGM: 85.00,
        notes: 'Check seal integrity and hydraulic fluid levels',
      },
      {
        id: 'part-press-pressure-relief',
        assetId: 'asset-press-003',
        partNumber: 'PRV-500-SAFE',
        partName: 'Pressure Relief Valve',
        sapNumber: 'SAP-200456',
        componentClassification: 'Critical',
        pmType: 'PM',
        smpNumber: 202,
        frequencyPM: '6M',
        maintenanceTimeMinutes: 90,
        frequencyAM: 'M',
        autonomousTimeMinutes: 15,
        frequencyQM: '3M',
        qualityTimeMinutes: 60,
        frequencyGM: 'M',
        generalTimeMinutes: 20,
        estimatedCostPM: 420.00,
        estimatedCostAM: 18.00,
        estimatedCostQM: 220.00,
        estimatedCostGM: 45.00,
        notes: 'Safety critical - test pressure settings',
      },
      {
        id: 'part-press-hydraulic-pump',
        assetId: 'asset-press-003',
        partNumber: 'HPP-75-MAIN',
        partName: 'Hydraulic Power Unit',
        sapNumber: 'SAP-200789',
        componentClassification: 'Critical',
        pmType: 'PM',
        smpNumber: 203,
        frequencyPM: '6M',
        maintenanceTimeMinutes: 150,
        frequencyAM: '2W',
        autonomousTimeMinutes: 25,
        frequencyQM: '12M',
        qualityTimeMinutes: 90,
        frequencyGM: '3M',
        generalTimeMinutes: 40,
        estimatedCostPM: 780.00,
        estimatedCostAM: 28.00,
        estimatedCostQM: 380.00,
        estimatedCostGM: 70.00,
        notes: 'Monitor pump performance and filter condition',
      },
    ];

    for (const part of pressParts) {
      await db.sql`INSERT OR REPLACE INTO AssetPart (
        id, assetId, partNumber, partName, sapNumber, componentClassification,
        pmType, smpNumber, frequencyPM, maintenanceTimeMinutes,
        frequencyAM, autonomousTimeMinutes, frequencyQM, qualityTimeMinutes,
        frequencyGM, generalTimeMinutes, estimatedCostPM, estimatedCostAM,
        estimatedCostQM, estimatedCostGM, notes, createdAt, updatedAt
      ) VALUES (
        ${part.id}, ${part.assetId}, ${part.partNumber}, ${part.partName},
        ${part.sapNumber}, ${part.componentClassification}, ${part.pmType},
        ${part.smpNumber}, ${part.frequencyPM}, ${part.maintenanceTimeMinutes},
        ${part.frequencyAM}, ${part.autonomousTimeMinutes}, ${part.frequencyQM},
        ${part.qualityTimeMinutes}, ${part.frequencyGM}, ${part.generalTimeMinutes},
        ${part.estimatedCostPM}, ${part.estimatedCostAM}, ${part.estimatedCostQM},
        ${part.estimatedCostGM}, ${part.notes}, datetime('now'), datetime('now')
      )`;
      console.log(`  ✓ Created part: ${part.partName}`);
    }

    console.log('\n✅ WCM sample data seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   - ${assets.length} assets created`);
    console.log(`   - ${cncParts.length} CNC parts created`);
    console.log(`   - ${pressParts.length} Press parts created`);
    console.log(`   - Total: ${cncParts.length + pressParts.length} WCM components`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await db.close();
  }
}

seedWCMData();
