'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface AssetPart {
  id: string;
  itemId?: string; // Optional - for inventory-linked parts
  // Standalone BOM fields
  partNumber: string;
  sapNumber?: string; // SAP material number
  partName: string;
  description?: string;
  manufacturer?: string;
  modelNumber?: string;
  unitOfMeasure: string;
  quantity: number;
  isPrimary: boolean;
  componentClassification?: string; // WCM field
  maintenanceTimeMinutes?: number; // WCM field
  maintenanceInterval?: number;
  lastReplacedDate?: string;
  nextReplacementDue?: string;
  notes?: string;
  // Optional inventory data (only present if itemId is set)
  inventory?: {
    unitCost: number;
    currency: string;
    categoryName?: string;
    totalStock?: number;
    availableStock?: number;
  };
}

interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  manufacturer?: string;
  modelNumber?: string;
  unitOfMeasure: string;
  unitCost: number;
  currency: string;
  categoryName?: string;
  totalStock?: number;
  availableStock?: number;
}

interface AssetPartsManagerProps {
  assetId: string;
  assetName: string;
  onClose: () => void;
}

export default function AssetPartsManager({ assetId, assetName, onClose }: AssetPartsManagerProps) {
  const [parts, setParts] = useState<AssetPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'inventory' | 'manual'>('manual'); // Default to manual BOM entry
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportData, setBulkImportData] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ESC key to close main modal
  useEscapeKey(onClose);

  // ESC key to close add modal (if open)
  useEscapeKey(() => setShowAddModal(false), showAddModal);

  // ESC key to close bulk import modal (if open)
  useEscapeKey(() => setShowBulkImport(false), showBulkImport);

  // Manual part entry form
  const [manualPart, setManualPart] = useState({
    partNumber: '',
    sapNumber: '',
    partName: '',
    description: '',
    manufacturer: '',
    modelNumber: '',
    unitOfMeasure: 'EA',
    quantity: 1,
    isPrimary: false,
    componentClassification: '',
    maintenanceTimeMinutes: '',
    maintenanceInterval: '',
    notes: '',
  });

  useEffect(() => {
    loadAssetParts();
  }, [assetId]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchInventory();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const loadAssetParts = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/assets/${assetId}/parts`);
      setParts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  const searchInventory = async () => {
    try {
      setSearching(true);
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const organizationId = user?.organizationId || 'org-test-1';

      const data = await api.get('/assets/inventory/search', {
        organizationId,
        searchTerm,
        limit: 50,
      });
      setSearchResults(data);
    } catch (err: any) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const addPartToAsset = async (itemId: string, quantity: number = 1, isPrimary: boolean = false) => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      await api.post(`/assets/${assetId}/parts`, {
        itemId,
        quantity,
        isPrimary,
        createdById: user?.id || '',
      });

      await loadAssetParts();
      setSearchTerm('');
      setSearchResults([]);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add part');
    }
  };

  const addManualPart = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!manualPart.partNumber || !manualPart.partName) {
        alert('Part Number and Part Name are required');
        return;
      }

      await api.post(`/assets/${assetId}/parts`, {
        partNumber: manualPart.partNumber,
        sapNumber: manualPart.sapNumber || undefined,
        partName: manualPart.partName,
        description: manualPart.description || undefined,
        manufacturer: manualPart.manufacturer || undefined,
        modelNumber: manualPart.modelNumber || undefined,
        unitOfMeasure: manualPart.unitOfMeasure || 'EA',
        quantity: manualPart.quantity,
        isPrimary: manualPart.isPrimary,
        componentClassification: manualPart.componentClassification || undefined,
        maintenanceTimeMinutes: manualPart.maintenanceTimeMinutes ? parseInt(manualPart.maintenanceTimeMinutes) : undefined,
        maintenanceInterval: manualPart.maintenanceInterval ? parseInt(manualPart.maintenanceInterval) : undefined,
        notes: manualPart.notes || undefined,
        createdById: user?.id || '',
      });

      await loadAssetParts();
      setShowAddModal(false);
      // Reset form
      setManualPart({
        partNumber: '',
        sapNumber: '',
        partName: '',
        description: '',
        manufacturer: '',
        modelNumber: '',
        unitOfMeasure: 'EA',
        quantity: 1,
        isPrimary: false,
        componentClassification: '',
        maintenanceTimeMinutes: '',
        maintenanceInterval: '',
        notes: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add part');
    }
  };

  const removePartFromAsset = async (partId: string) => {
    if (!confirm('Remove this part from the asset?')) return;

    try {
      await api.delete(`/assets/parts/${partId}`);
      await loadAssetParts();
    } catch (err: any) {
      alert(err.message || 'Failed to remove part');
    }
  };

  const bulkRemoveParts = async () => {
    if (selectedParts.size === 0) return;
    if (!confirm(`Remove ${selectedParts.size} selected part(s) from this asset?`)) return;

    try {
      const partIds = Array.from(selectedParts);
      // Remove each part individually
      for (const partId of partIds) {
        await api.delete(`/assets/parts/${partId}`);
      }
      setSelectedParts(new Set());
      await loadAssetParts();
    } catch (err: any) {
      alert(err.message || 'Failed to remove parts');
    }
  };

  const handleBulkImport = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      // Parse CSV/TSV format: partNumber, sapNumber, partName, description, manufacturer, modelNumber, unitOfMeasure, quantity, isPrimary, componentClassification, maintenanceTimeMinutes, maintenanceInterval, notes
      const lines = bulkImportData.split('\n').filter(line => line.trim());
      const partsToImport: any[] = [];

      for (const line of lines) {
        const fields = line.split(/[,\t]/).map(s => s.trim());
        const [partNumber, sapNumber, partName, description, manufacturer, modelNumber, unitOfMeasure, quantityStr, isPrimaryStr, componentClassification, maintenanceTimeStr, maintenanceIntervalStr, notes] = fields;

        if (!partNumber || !partName) {
          continue; // Skip invalid lines
        }

        partsToImport.push({
          partNumber,
          sapNumber: sapNumber || undefined,
          partName,
          description: description || undefined,
          manufacturer: manufacturer || undefined,
          modelNumber: modelNumber || undefined,
          unitOfMeasure: unitOfMeasure || 'EA',
          quantity: parseFloat(quantityStr) || 1,
          isPrimary: isPrimaryStr === 'true' || isPrimaryStr === '1',
          componentClassification: componentClassification || undefined,
          maintenanceTimeMinutes: maintenanceTimeStr ? parseInt(maintenanceTimeStr) : undefined,
          maintenanceInterval: maintenanceIntervalStr ? parseInt(maintenanceIntervalStr) : undefined,
          notes: notes || undefined,
        });
      }

      if (partsToImport.length === 0) {
        alert('No valid parts found to import');
        return;
      }

      const result = await api.post(`/assets/${assetId}/parts/bulk`, {
        parts: partsToImport,
        createdById: user?.id || '',
      });

      alert(`Import complete: ${result.success} succeeded, ${result.failed} failed`);
      setShowBulkImport(false);
      setBulkImportData('');
      await loadAssetParts();
    } catch (err: any) {
      alert(err.message || 'Bulk import failed');
    }
  };

  const togglePartSelection = (itemId: string) => {
    const newSet = new Set(selectedParts);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    setSelectedParts(newSet);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-start justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="inline-block w-full max-w-6xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Machine Parts</h2>
              <p className="text-sm text-gray-600">{assetName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkImport(true)}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📥 Bulk Import
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Parts
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl px-2"
              >
                ×
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Parts List */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {parts.length} part(s) linked to this asset
                {selectedParts.size > 0 && ` • ${selectedParts.size} selected`}
              </p>
              {selectedParts.size > 0 && (
                <button
                  onClick={bulkRemoveParts}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove Selected
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500">Loading parts...</div>
            ) : parts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-6xl mb-4">🔧</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No parts added yet</h3>
                <p className="text-gray-600 mb-4">Add parts from your inventory to track what this machine uses.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add First Part
                </button>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParts(new Set(parts.map(p => p.id)));
                            } else {
                              setSelectedParts(new Set());
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part #</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SAP #</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Primary</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parts.map((part) => (
                      <tr key={part.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedParts.has(part.id)}
                            onChange={() => togglePartSelection(part.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {part.partNumber}
                          {!part.itemId && <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">BOM</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {part.sapNumber || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{part.partName}</div>
                          {part.manufacturer && (
                            <div className="text-xs text-gray-500">{part.manufacturer}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {part.quantity} {part.unitOfMeasure}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {part.inventory ? (
                            <span className={part.inventory.availableStock && part.inventory.availableStock > 0 ? 'text-green-600' : 'text-red-600'}>
                              {part.inventory.availableStock || 0}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {part.inventory ? (
                            `${part.inventory.currency} ${part.inventory.unitCost.toFixed(2)}`
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {part.isPrimary && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">★ Primary</span>}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => removePartFromAsset(part.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Parts Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add Parts to Asset</h3>

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6 border-b">
                  <button
                    onClick={() => setAddMode('manual')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      addMode === 'manual'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📝 Manual Entry (BOM)
                  </button>
                  <button
                    onClick={() => setAddMode('inventory')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      addMode === 'inventory'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📦 From Inventory
                  </button>
                </div>

                {/* Manual Entry Form */}
                {addMode === 'manual' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Part Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={manualPart.partNumber}
                          onChange={(e) => setManualPart({ ...manualPart, partNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="e.g., PART-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SAP Number
                        </label>
                        <input
                          type="text"
                          value={manualPart.sapNumber}
                          onChange={(e) => setManualPart({ ...manualPart, sapNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="e.g., 10012345"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Part Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={manualPart.partName}
                          onChange={(e) => setManualPart({ ...manualPart, partName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="e.g., Hydraulic Pump"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={manualPart.description}
                        onChange={(e) => setManualPart({ ...manualPart, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Brief description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                        <input
                          type="text"
                          value={manualPart.manufacturer}
                          onChange={(e) => setManualPart({ ...manualPart, manufacturer: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
                        <input
                          type="text"
                          value={manualPart.modelNumber}
                          onChange={(e) => setManualPart({ ...manualPart, modelNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ABC Classification (WCM)
                        </label>
                        <select
                          value={manualPart.componentClassification}
                          onChange={(e) => setManualPart({ ...manualPart, componentClassification: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="">Select ABC Class</option>
                          <option value="A">A - Critical (High importance, causes downtime, safety critical)</option>
                          <option value="B">B - Important (Moderate importance, affects quality/performance)</option>
                          <option value="C">C - Standard (Low criticality, routine maintenance)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Time (min)</label>
                        <input
                          type="number"
                          min="0"
                          value={manualPart.maintenanceTimeMinutes}
                          onChange={(e) => setManualPart({ ...manualPart, maintenanceTimeMinutes: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Time to replace/service"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                        <select
                          value={manualPart.unitOfMeasure}
                          onChange={(e) => setManualPart({ ...manualPart, unitOfMeasure: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="EA">Each (EA)</option>
                          <option value="BOX">Box</option>
                          <option value="KG">Kilogram (KG)</option>
                          <option value="L">Liter (L)</option>
                          <option value="M">Meter (M)</option>
                          <option value="SET">Set</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={manualPart.quantity}
                          onChange={(e) => setManualPart({ ...manualPart, quantity: parseFloat(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maint. Interval (days)</label>
                        <input
                          type="number"
                          value={manualPart.maintenanceInterval}
                          onChange={(e) => setManualPart({ ...manualPart, maintenanceInterval: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={manualPart.notes}
                        onChange={(e) => setManualPart({ ...manualPart, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Additional notes..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPrimary"
                        checked={manualPart.isPrimary}
                        onChange={(e) => setManualPart({ ...manualPart, isPrimary: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="isPrimary" className="text-sm text-gray-700">
                        Mark as Primary Part ⭐
                      </label>
                    </div>
                  </div>
                )}

                {/* Inventory Search */}
                {addMode === 'inventory' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Inventory
                      </label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by part number, name, or description..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>

                    {searching && <p className="text-sm text-gray-500">Searching...</p>}

                    {searchResults.length > 0 && (
                      <div className="border rounded-lg max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Part #</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Stock</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {searchResults.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-sm font-medium text-blue-600">{item.partNumber}</td>
                                <td className="px-3 py-2">
                                  <div className="text-sm text-gray-900">{item.name}</div>
                                  {item.manufacturer && <div className="text-xs text-gray-500">{item.manufacturer}</div>}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-600">{item.availableStock || 0}</td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => addPartToAsset(item.id)}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    Add
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSearchTerm('');
                      setSearchResults([]);
                      setAddMode('manual');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {addMode === 'manual' && (
                    <button
                      onClick={addManualPart}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Part
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bulk Import Modal */}
          {showBulkImport && (
            <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Bulk Import Parts (BOM)</h3>

                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Format:</strong> CSV or tab-delimited with the following columns (in order):
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block overflow-x-auto">
                    partNumber, sapNumber, partName, description, manufacturer, modelNumber, unitOfMeasure, quantity, isPrimary, componentClassification, maintenanceTimeMinutes, maintenanceInterval, notes
                  </code>
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>Note:</strong> Only partNumber and partName are required. Leave other fields empty if not needed.
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <strong>ABC Classifications (WCM):</strong> A (Critical), B (Important), C (Standard)
                  </p>
                </div>

                <textarea
                  value={bulkImportData}
                  onChange={(e) => setBulkImportData(e.target.value)}
                  placeholder="PUMP-001, 10012345, Hydraulic Pump, Main hydraulic system pump, Bosch, HP-200, EA, 1, true, A, 120, 180, Replace annually&#10;FILTER-023, 10067890, Oil Filter, Engine oil filter, Mann, W920/21, EA, 2, false, B, 15, 90, Replace quarterly"
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs text-gray-900"
                />

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowBulkImport(false);
                      setBulkImportData('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkImport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Import Parts
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
