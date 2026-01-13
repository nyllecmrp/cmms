# Migration Guide: JSON Maintenance Parts → AssetPart Table

## Overview

This migration converts the old JSON-based `maintenanceParts` field in the `Asset` table to proper relational records in the `AssetPart` junction table, linking assets to inventory items.

## What Changed?

### Before (Old System):
- **Storage**: JSON text in `Asset.maintenanceParts` column
- **Structure**: `[{name, quantity, estimatedCost}]`
- **Limitations**: No inventory integration, no stock tracking, manual entry only
- **Use Case**: Simple reference list of 5-10 parts

### After (New System):
- **Storage**: `AssetPart` junction table + `InventoryItem` master table
- **Structure**: Relational with full foreign keys
- **Features**:
  - Real inventory integration
  - Stock level tracking
  - Bulk import (hundreds/thousands of parts)
  - Maintenance intervals and replacement tracking
  - Part numbers, manufacturers, models
  - Transaction history via `InventoryTransaction`
- **Use Case**: Complex machines with 50-10,000+ parts

## Running the Migration

### Prerequisites

1. Ensure you have organizations in the database:
   ```bash
   # Via API (with secret key)
   curl "http://localhost:3001/api/seed?secret=YOUR_SECRET_KEY"
   ```

2. Apply migrations:
   ```bash
   # Inventory tables
   cat backend/database/migrations/003_add_inventory_tables.sql | sqlite3 backend/dev.db

   # AssetPart table
   cat backend/database/migrations/004_add_asset_parts.sql | sqlite3 backend/dev.db
   ```

3. Seed inventory system:
   ```bash
   cd backend && node scripts/seed-inventory-init.js
   ```

### Run Migration

```bash
cd backend
node scripts/migrate-maintenance-parts.js
```

The script will:
1. ✅ Find all assets with JSON `maintenanceParts`
2. ✅ For each part, create or match existing `InventoryItem` records
3. ✅ Create `AssetPart` junction records linking assets to inventory
4. ✅ Generate unique part numbers automatically
5. ✅ Provide detailed statistics
6. ❓ Ask if you want to clear the old JSON field (recommended: Yes)

## Migration Process Details

### Part Number Generation

For parts without a part number, the script generates one:
```
PART-{SANITIZED_NAME}-{RANDOM_SUFFIX}
Example: PART-HYDRAULIC-PUMP-A3F2D1
```

### Inventory Item Creation

New inventory items are created with:
- **Part Number**: Auto-generated or from existing
- **Name**: From JSON part name
- **Unit Cost**: From `estimatedCost`
- **Currency**: PHP (default)
- **Minimum Stock**: Set to quantity needed
- **Description**: "Migrated from asset {assetNumber}"

### Stock Records

Initial stock records are created at quantity 0 (items need to be purchased).

## Post-Migration

### Frontend Changes

The **AssetForm** component now:
- ❌ Removed: JSON maintenance parts input fields
- ✅ Added: Tip directing users to use "🔧 Parts" button
- ✅ New: Access full AssetPartsManager from assets list

### Using the New System

1. **View/Edit Asset**: Go to Assets page
2. **Click "🔧 Parts"**: Opens parts manager modal
3. **Search & Add**: Search inventory and add parts
4. **Bulk Import**: Paste CSV data for hundreds/thousands of parts
5. **Manage**: Update quantities, flag primary parts, track replacements

### CSV Format for Bulk Import

```csv
partNumber, quantity, isPrimary, notes
PUMP-001, 2, true, Critical component
FILTER-234, 5, false, Consumable
BEARING-789, 4, true, Replace annually
```

## Rollback

If you need to rollback:

1. The old JSON field is preserved (unless you chose to clear it)
2. You can delete AssetPart records:
   ```sql
   DELETE FROM AssetPart;
   ```
3. The inventory items created can be kept or removed

## Statistics Example

```
📊 Migration Summary
================================================
Assets processed:          15
Parts found in JSON:       87
Inventory items created:   62
Inventory items reused:    25
AssetPart links created:   87
AssetPart links skipped:   0
Errors encountered:        0
================================================
```

## Troubleshooting

### "No organizations found"
- Run seed script first: `curl "http://localhost:3001/api/seed?secret=..."`

### "FOREIGN KEY constraint failed"
- Ensure inventory migrations are applied
- Check that organizations and stock locations exist

### "Part already exists"
- This is expected when parts were already migrated
- The script will skip duplicates

## Support

For issues or questions, contact the development team or check the main CMMS documentation.
