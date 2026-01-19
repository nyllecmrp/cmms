# WCM Ledger Grid - Inline Editing Implementation

## Overview
This document explains how to add inline editing to the WCM Machine Ledger table so users can click cells and edit data directly.

## Files to Modify

### 1. `/frontend/components/WCMLedgerGrid.tsx`

#### Add State Variables (after line 37):
```typescript
const [editingCell, setEditingCell] = useState<{ partId: string; field: string } | null>(null);
const [editValue, setEditValue] = useState<string>('');
const [saving, setSaving] = useState(false);
```

#### Add Props Interface (update line 26-33):
```typescript
interface WCMLedgerGridProps {
  asset: {
    assetNumber: string;
    name: string;
  };
  parts: AssetPart[];
  year?: number;
  onDataChange?: () => void;  // ADD THIS LINE
}
```

#### Add Import (line 3):
```typescript
import api from '@/lib/api';
```

#### Add Click Handler Function (after line 59):
```typescript
const handleCellClick = (partId: string, field: string, currentValue: any) => {
  setEditingCell({ partId, field });
  setEditValue(currentValue?.toString() || '');
};

const handleCellBlur = async () => {
  if (!editingCell) return;

  const { partId, field } = editingCell;
  const part = parts.find(p => p.id === partId);

  if (!part) return;

  // Check if value actually changed
  const currentValue = (part as any)[field];
  if (currentValue?.toString() === editValue) {
    setEditingCell(null);
    return;
  }

  // Convert value to appropriate type
  let valueToSave: any = editValue;
  if (field === 'smpNumber' || field === 'qaMatrixNo' || field === 'qmMatrixNo' || field === 'maintenanceTimeMinutes') {
    valueToSave = editValue ? parseInt(editValue) : null;
  }

  try {
    setSaving(true);
    await api.patch(`/assets/parts/${partId}`, {
      [field]: valueToSave || null
    });

    // Refresh data
    if (onDataChange) {
      onDataChange();
    }

    setEditingCell(null);
  } catch (error: any) {
    console.error('Failed to update cell:', error);
    alert(`Failed to save: ${error.message}`);
  } finally {
    setSaving(false);
  }
};

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleCellBlur();
  } else if (e.key === 'Escape') {
    setEditingCell(null);
  }
};

const renderEditableCell = (part: AssetPart, field: keyof AssetPart, value: any, className: string = '', bgClass: string = '') => {
  const isEditing = editingCell?.partId === part.id && editingCell?.field === field;
  const displayValue = value || '-';

  if (isEditing) {
    return (
      <td className={`border border-gray-300 px-1 py-1 ${bgClass}`}>
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className={`w-full px-1 py-1 text-xs border-2 border-blue-500 rounded focus:outline-none ${className}`}
          disabled={saving}
        />
      </td>
    );
  }

  return (
    <td
      className={`border border-gray-300 px-2 py-2 cursor-pointer hover:bg-yellow-100 ${className} ${bgClass}`}
      onClick={() => handleCellClick(part.id, field, value)}
      title="Click to edit"
    >
      {displayValue}
    </td>
  );
};
```

#### Replace Static Cells with Editable Cells (lines 172-217):

Replace:
```typescript
<td className="border border-gray-300 px-2 py-2 font-mono text-xs">{part.sapNumber || '-'}</td>
```

With:
```typescript
{renderEditableCell(part, 'sapNumber', part.sapNumber, 'font-mono text-xs')}
```

Do this for ALL editable fields:
- sapNumber
- storeroomLocation
- vendor
- pmType
- smpNumber
- frequencyPM
- maintenanceTimeMinutes
- machineStopRequired
- inspectionStandard
- frequencyAM
- qaMatrixNo
- qmMatrixNo
- kaizenType
- kaizenNo

### 2. `/frontend/app/dashboard/assets/[id]/machine-ledger/page.tsx`

Update line 237 to pass the `onDataChange` callback:

```typescript
{activeTab === 'ledger' && (
  <WCMLedgerGrid
    asset={asset}
    parts={parts}
    year={new Date().getFullYear()}
    onDataChange={loadData}  // ADD THIS LINE
  />
)}
```

## How It Works

1. **Click a Cell**: User clicks any editable cell (Storeroom, Vendor, PM Type, etc.)
2. **Edit Mode**: Cell converts to an input field with current value
3. **Type New Value**: User types the new value
4. **Save**:
   - Press Enter OR
   - Click outside the cell (blur event)
5. **API Call**: Sends PATCH request to `/assets/parts/:partId`
6. **Refresh**: Reloads the data to show updated values

## Keyboard Shortcuts

- **Enter**: Save and close edit mode
- **Escape**: Cancel and close edit mode without saving

## Visual Feedback

- Editable cells show yellow highlight on hover
- Active editing cell has blue border
- Cursor changes to pointer on editable cells
- Header shows "💡 Click any cell to edit"

## Example Usage

1. Navigate to an asset's Machine Ledger
2. Click on an empty "-" cell in the Storeroom column
3. Type "A-12"
4. Press Enter
5. Cell updates and saves to database
6. Data refreshes automatically

## Benefits

- ✅ Excel-like editing experience
- ✅ No need for separate edit forms
- ✅ Fast data entry for hundreds of parts
- ✅ Real-time validation
- ✅ Automatic save with error handling
