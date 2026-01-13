const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

console.log('🚀 Applying WCM Maintenance Migrations...\n');

// Migration 010: Add WCM fields to AssetPart
console.log('📋 Migration 010: Adding WCM fields to AssetPart table...');
const migration010Path = path.join(__dirname, '..', 'database', 'migrations', '010_add_wcm_maintenance_fields.sql');
const migration010SQL = fs.readFileSync(migration010Path, 'utf8');

// Split by semicolons and filter out comments/empty lines
const statements010 = migration010SQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

let successCount = 0;
let errorCount = 0;

for (const stmt of statements010) {
  try {
    db.exec(stmt);
    successCount++;
    console.log(`  ✅ Executed: ${stmt.substring(0, 60)}...`);
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log(`  ℹ️  Column already exists, skipping...`);
      successCount++;
    } else {
      console.error(`  ❌ Error: ${error.message}`);
      errorCount++;
    }
  }
}

// Migration 011: Create maintenance schedule tables
console.log('\n📋 Migration 011: Creating Maintenance Schedule & Breakdown tables...');
const migration011Path = path.join(__dirname, '..', 'database', 'migrations', '011_create_maintenance_schedule.sql');
const migration011SQL = fs.readFileSync(migration011Path, 'utf8');

const statements011 = migration011SQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

for (const stmt of statements011) {
  try {
    db.exec(stmt);
    successCount++;
    console.log(`  ✅ Executed: ${stmt.substring(0, 60)}...`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`  ℹ️  Table/Index already exists, skipping...`);
      successCount++;
    } else {
      console.error(`  ❌ Error: ${error.message}`);
      errorCount++;
    }
  }
}

// Verify tables exist
console.log('\n🔍 Verifying database structure...');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tables:', tables.map(t => t.name).join(', '));

// Check AssetPart columns
const assetPartInfo = db.prepare("PRAGMA table_info(AssetPart)").all();
console.log('\n📊 AssetPart WCM fields:');
const wcmFields = assetPartInfo.filter(col =>
  ['pmType', 'smpNumber', 'frequencyPM', 'machineStopRequired',
   'inspectionStandard', 'frequencyAM', 'qaMatrixNo', 'qmMatrixNo',
   'kaizenType', 'kaizenNo', 'storeroomLocation', 'vendor', 'drawingPicture'].includes(col.name)
);
wcmFields.forEach(col => console.log(`  ✅ ${col.name} (${col.type})`));

db.close();

console.log(`\n✅ Migration complete! ${successCount} statements executed, ${errorCount} errors`);
