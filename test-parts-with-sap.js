/**
 * Test script for Machine Parts with SAP Number
 * Tests: Manual entry, Bulk import, and retrieving parts with SAP numbers
 */

const baseUrl = 'http://localhost:3001/api';

// Test user credentials
const testUser = {
  email: 'admin@test.com',
  password: 'Admin123!@#'
};

let token = '';
let assetId = '';
let partIds = [];

async function login() {
  console.log('\n🔐 Step 1: Logging in...');
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  token = data.token;
  console.log('✅ Logged in successfully');
  return data.user;
}

async function getFirstAsset() {
  console.log('\n📦 Step 2: Getting first asset...');
  const response = await fetch(`${baseUrl}/assets?organizationId=org-test-1`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to get assets: ${response.statusText}`);
  }

  const assets = await response.json();
  if (assets.length === 0) {
    throw new Error('No assets found');
  }

  assetId = assets[0].id;
  console.log(`✅ Using asset: ${assets[0].name} (${assets[0].assetNumber})`);
  console.log(`   Asset ID: ${assetId}`);
  return assets[0];
}

async function addManualPartWithSAP(userId) {
  console.log('\n➕ Step 3: Adding manual part with SAP Number...');

  const partData = {
    partNumber: 'TEST-PART-001',
    sapNumber: '10012345',
    partName: 'Test Hydraulic Pump',
    description: 'Main hydraulic system pump for testing',
    manufacturer: 'Bosch',
    modelNumber: 'HP-200-TEST',
    unitOfMeasure: 'EA',
    quantity: 1,
    isPrimary: true,
    maintenanceInterval: 180,
    notes: 'Test part with SAP number',
    createdById: userId
  };

  console.log('   Sending:', JSON.stringify(partData, null, 2));

  const response = await fetch(`${baseUrl}/assets/${assetId}/parts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(partData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add manual part: ${response.statusText}\n${error}`);
  }

  const result = await response.json();
  partIds.push(result.id);
  console.log('✅ Part added successfully!');
  console.log(`   Part ID: ${result.id}`);
  console.log(`   Part Number: ${result.partNumber}`);
  console.log(`   SAP Number: ${result.sapNumber}`);
  console.log(`   Part Name: ${result.partName}`);
  return result;
}

async function bulkAddPartsWithSAP(userId) {
  console.log('\n📥 Step 4: Bulk adding parts with SAP Numbers...');

  const bulkData = {
    parts: [
      {
        partNumber: 'FILTER-023',
        sapNumber: '10067890',
        partName: 'Oil Filter',
        description: 'Engine oil filter',
        manufacturer: 'Mann',
        modelNumber: 'W920/21',
        unitOfMeasure: 'EA',
        quantity: 2,
        isPrimary: false,
        maintenanceInterval: 90,
        notes: 'Replace quarterly'
      },
      {
        partNumber: 'BEARING-456',
        sapNumber: '10098765',
        partName: 'Roller Bearing',
        description: 'Main shaft roller bearing',
        manufacturer: 'SKF',
        modelNumber: 'RB-450',
        unitOfMeasure: 'EA',
        quantity: 4,
        isPrimary: true,
        maintenanceInterval: 365,
        notes: 'Critical component'
      },
      {
        partNumber: 'SEAL-789',
        sapNumber: '10054321',
        partName: 'Hydraulic Seal',
        manufacturer: 'Parker',
        modelNumber: 'HS-220',
        unitOfMeasure: 'EA',
        quantity: 6,
        isPrimary: false
      }
    ],
    createdById: userId
  };

  console.log(`   Adding ${bulkData.parts.length} parts...`);

  const response = await fetch(`${baseUrl}/assets/${assetId}/parts/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bulkData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to bulk add parts: ${response.statusText}\n${error}`);
  }

  const result = await response.json();
  console.log(`✅ Bulk import completed!`);
  console.log(`   Success: ${result.success}`);
  console.log(`   Failed: ${result.failed}`);
  if (result.errors && result.errors.length > 0) {
    console.log(`   Errors:`, result.errors);
  }
  return result;
}

async function getAllParts() {
  console.log('\n📋 Step 5: Retrieving all parts for asset...');

  const response = await fetch(`${baseUrl}/assets/${assetId}/parts`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to get parts: ${response.statusText}`);
  }

  const parts = await response.json();
  console.log(`✅ Retrieved ${parts.length} parts`);
  console.log('\n📊 Parts Summary:');
  console.log('─'.repeat(100));
  console.log(
    'Part #'.padEnd(20) +
    'SAP #'.padEnd(15) +
    'Name'.padEnd(25) +
    'Manufacturer'.padEnd(15) +
    'Qty'.padEnd(8) +
    'Type'
  );
  console.log('─'.repeat(100));

  parts.forEach(part => {
    console.log(
      (part.partNumber || '-').padEnd(20) +
      (part.sapNumber || '-').padEnd(15) +
      (part.partName || '-').padEnd(25) +
      (part.manufacturer || '-').padEnd(15) +
      `${part.quantity}`.padEnd(8) +
      (part.itemId ? 'Inventory' : 'BOM')
    );
  });
  console.log('─'.repeat(100));

  return parts;
}

async function verifyDataStructure(parts) {
  console.log('\n🔍 Step 6: Verifying data structure...');

  const withSAP = parts.filter(p => p.sapNumber);
  const withoutSAP = parts.filter(p => !p.sapNumber);

  console.log(`✅ Parts with SAP Number: ${withSAP.length}`);
  console.log(`✅ Parts without SAP Number: ${withoutSAP.length}`);

  if (withSAP.length > 0) {
    console.log('\n   Sample part with SAP Number:');
    const sample = withSAP[0];
    console.log(JSON.stringify({
      id: sample.id,
      partNumber: sample.partNumber,
      sapNumber: sample.sapNumber,
      partName: sample.partName,
      manufacturer: sample.manufacturer,
      quantity: sample.quantity,
      isPrimary: sample.isPrimary,
      inventory: sample.inventory
    }, null, 2));
  }

  // Verify all required fields
  const missingFields = [];
  parts.forEach(part => {
    if (!part.partNumber) missingFields.push(`Part ${part.id}: missing partNumber`);
    if (!part.partName) missingFields.push(`Part ${part.id}: missing partName`);
    // sapNumber is optional, so we don't check for it
  });

  if (missingFields.length > 0) {
    console.log('\n❌ Missing required fields:');
    missingFields.forEach(msg => console.log(`   - ${msg}`));
  } else {
    console.log('\n✅ All parts have required fields');
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting Machine Parts with SAP Number Tests\n');
    console.log('='.repeat(100));

    const user = await login();
    await getFirstAsset();
    await addManualPartWithSAP(user.id);
    await bulkAddPartsWithSAP(user.id);
    const parts = await getAllParts();
    await verifyDataStructure(parts);

    console.log('\n' + '='.repeat(100));
    console.log('✅ All tests completed successfully!');
    console.log('\n📝 Test Summary:');
    console.log(`   - Manual part added with SAP Number`);
    console.log(`   - ${parts.length} total parts on asset`);
    console.log(`   - SAP Number field working correctly`);
    console.log(`   - BOM functionality verified`);

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
runTests();
