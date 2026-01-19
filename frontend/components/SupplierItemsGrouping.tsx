'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface SupplierItemsGroupingProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onGeneratePOs: (groupedItems: { [supplier: string]: any[] }) => void;
}

export default function SupplierItemsGrouping({ isOpen, onClose, items, onGeneratePOs }: SupplierItemsGroupingProps) {
  const { user } = useAuth();
  const [itemSuppliers, setItemSuppliers] = useState<{ [index: number]: string }>(
    items.reduce((acc, _, idx) => ({ ...acc, [idx]: '' }), {})
  );
  const [itemPrices, setItemPrices] = useState<{ [index: number]: number }>(
    items.reduce((acc, item, idx) => ({ ...acc, [idx]: item.estimatedCost || item.price || 0 }), {})
  );
  const [itemQuantities, setItemQuantities] = useState<{ [index: number]: number }>(
    items.reduce((acc, item, idx) => ({ ...acc, [idx]: item.quantity || 1 }), {})
  );
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [bulkSupplier, setBulkSupplier] = useState('');
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [showSupplierList, setShowSupplierList] = useState(false);

  // Load suppliers from database on mount
  useEffect(() => {
    const loadSuppliers = async () => {
      if (!user?.organizationId || !isOpen) return;

      try {
        setLoadingSuppliers(true);
        const data = await api.getSuppliers(user.organizationId) as any[];
        const supplierNames = data.map((s: any) => s.name);
        setSuppliers(supplierNames);
      } catch (error) {
        console.error('Failed to load suppliers:', error);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    loadSuppliers();
  }, [isOpen, user?.organizationId]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleItem = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((_, idx) => idx)));
    }
  };

  const handleBulkAssign = () => {
    if (!bulkSupplier || selectedItems.size === 0) return;
    
    const updated = { ...itemSuppliers };
    selectedItems.forEach(idx => {
      updated[idx] = bulkSupplier;
    });
    setItemSuppliers(updated);
    setSelectedItems(new Set());
    setBulkSupplier('');
  };

const handleGenerate = () => {
    // Group items by supplier
    const grouped: { [supplier: string]: any[] } = {};

    items.forEach((item, index) => {
      const supplier = itemSuppliers[index];
      if (supplier) {
        if (!grouped[supplier]) {
          grouped[supplier] = [];
        }
        // Update item with edited price and quantity
        grouped[supplier].push({
          ...item,
          estimatedCost: itemPrices[index],
          price: itemPrices[index],
          quantity: itemQuantities[index]
        });
      }
    });

    // Check if all items have suppliers assigned
    const unassigned = items.filter((_, idx) => !itemSuppliers[idx]);
    if (unassigned.length > 0) {
      alert(`Please assign suppliers to all ${unassigned.length} remaining item(s)`);
      return;
    }

    onGeneratePOs(grouped);
  };

  const getSupplierStats = () => {
    const stats: { [supplier: string]: { count: number; total: number } } = {};

    items.forEach((item, index) => {
      const supplier = itemSuppliers[index];
      if (supplier) {
        if (!stats[supplier]) {
          stats[supplier] = { count: 0, total: 0 };
        }
        stats[supplier].count++;
        stats[supplier].total += (itemPrices[index] || 0) * (itemQuantities[index] || 1);
      }
    });

    return stats;
  };

  const supplierStats = getSupplierStats();
  const assignedCount = Object.values(itemSuppliers).filter(s => s).length;
  const unassignedCount = items.length - assignedCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assign Suppliers to Items</h2>
              <p className="text-sm text-gray-600 mt-1">
                Group items by supplier to generate separate Purchase Orders
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>

          {/* Progress Stats & Bulk Actions */}
          <div className="mt-4 flex gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div className="bg-blue-50 rounded-lg px-4 py-2">
                <span className="text-sm text-blue-600 font-semibold">
                  {assignedCount} of {items.length} items assigned
                </span>
              </div>
              {unassignedCount > 0 && (
                <div className="bg-orange-50 rounded-lg px-4 py-2">
                  <span className="text-sm text-orange-600 font-semibold">
                    {unassignedCount} items need suppliers
                  </span>
                </div>
              )}
              {selectedItems.size > 0 && (
                <div className="bg-purple-50 rounded-lg px-4 py-2">
                  <span className="text-sm text-purple-600 font-semibold">
                    {selectedItems.size} items selected
                  </span>
                </div>
              )}
            </div>

            {/* Bulk Assignment */}
            {selectedItems.size > 0 && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">Assign selected to:</span>
                <select
                  value={bulkSupplier}
                  onChange={(e) => setBulkSupplier(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((supplier, idx) => (
                    <option key={idx} value={supplier}>{supplier}</option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAssign}
                  disabled={!bulkSupplier}
                  className="px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 text-sm font-medium"
                >
                  Assign
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Items Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === items.length && items.length > 0}
                      onChange={handleToggleAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Item</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Assign to Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={index} className={`hover:bg-gray-50 ${selectedItems.has(index) ? 'bg-purple-50' : ''}`}>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(index)}
                        onChange={() => handleToggleItem(index)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={itemQuantities[index]}
                        onChange={(e) => setItemQuantities({ ...itemQuantities, [index]: parseInt(e.target.value) || 1 })}
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-center"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₱</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={itemPrices[index]}
                          onChange={(e) => setItemPrices({ ...itemPrices, [index]: parseFloat(e.target.value) || 0 })}
                          className="w-32 pl-6 pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-right"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-gray-900">
                        ₱{((itemPrices[index] || 0) * (itemQuantities[index] || 1)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={itemSuppliers[index] || ''}
                        onChange={(e) => setItemSuppliers({ ...itemSuppliers, [index]: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                          !itemSuppliers[index] ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select supplier...</option>
                        {suppliers.map((supplier, idx) => (
                          <option key={idx} value={supplier}>{supplier}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {Object.keys(supplierStats).length > 0 && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Purchase Orders to Generate</h3>
              <div className="space-y-2">
                {Object.entries(supplierStats).map(([supplier, stats]) => (
                  <div key={supplier} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{supplier}</span>
                    <span className="text-gray-600">
                      {stats.count} item{stats.count !== 1 ? 's' : ''} • ₱{stats.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={unassignedCount > 0 || suppliers.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Generate {Object.keys(supplierStats).length} PO{Object.keys(supplierStats).length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
