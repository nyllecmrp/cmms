const { Database } = require('@sqlitecloud/drivers');

const db = new Database('sqlitecloud://cwv6rvpmdk.g2.sqlite.cloud:8860/my-database-cmms.sqlitecloud?apikey=GFwhrD0kqA8NlZxgejGAPyaVRhwpLq7NCAFbqWQjW24');

async function seedSimpleWCMData() {
  console.log('🌱 Seeding simple WCM sample data...\n');

  try {
    // Assets already created, just add parts using existing columns
    console.log('🔧 Creating WCM parts for CNC Mill (asset-cnc-mill-001)...');

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
        notes: 'Inspect tool grippers and carousel alignment',
      },
    ];

    for (const part of cncParts) {
      await db.sql`INSERT OR REPLACE INTO AssetPart (
        id, assetId, partNumber, partName, sapNumber, componentClassification,
        pmType, smpNumber, frequencyPM, maintenanceTimeMinutes, frequencyAM,
        notes, createdAt, updatedAt
      ) VALUES (
        ${part.id}, ${part.assetId}, ${part.partNumber}, ${part.partName},
        ${part.sapNumber}, ${part.componentClassification}, ${part.pmType},
        ${part.smpNumber}, ${part.frequencyPM}, ${part.maintenanceTimeMinutes},
        ${part.frequencyAM}, ${part.notes}, datetime('now'), datetime('now')
      )`;
      console.log(`  ✓ Created: ${part.partName}`);
    }

    console.log('\n🔧 Creating WCM parts for Hydraulic Press (asset-press-003)...');

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
        notes: 'Monitor pump performance and filter condition',
      },
    ];

    for (const part of pressParts) {
      await db.sql`INSERT OR REPLACE INTO AssetPart (
        id, assetId, partNumber, partName, sapNumber, componentClassification,
        pmType, smpNumber, frequencyPM, maintenanceTimeMinutes, frequencyAM,
        notes, createdAt, updatedAt
      ) VALUES (
        ${part.id}, ${part.assetId}, ${part.partNumber}, ${part.partName},
        ${part.sapNumber}, ${part.componentClassification}, ${part.pmType},
        ${part.smpNumber}, ${part.frequencyPM}, ${part.maintenanceTimeMinutes},
        ${part.frequencyAM}, ${part.notes}, datetime('now'), datetime('now')
      )`;
      console.log(`  ✓ Created: ${part.partName}`);
    }

    console.log('\n✅ WCM sample data seeding completed!');
    console.log(`\n📊 Total: ${cncParts.length + pressParts.length} WCM components created`);
    console.log('\n🎯 Ready to test:');
    console.log('   - Navigate to Assets > CNC Milling Machine (CNC-001)');
    console.log('   - View Machine Ledger tab');
    console.log('   - Generate maintenance schedule for 2025');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await db.close();
  }
}

seedSimpleWCMData();
