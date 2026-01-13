'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface AssetPart {
  id: string;
  partNumber: string;
  sapNumber?: string;
  partName: string;
  description?: string;
  manufacturer?: string;
  modelNumber?: string;
  unitOfMeasure: string;
  quantity: number;
  isPrimary: boolean;
  componentClassification?: string;
  maintenanceTimeMinutes?: number;
  maintenanceInterval?: number;
  notes?: string;
  // WCM Fields
  pmType?: string;
  smpNumber?: number;
  frequencyPM?: string;
  machineStopRequired?: string;
  inspectionStandard?: string;
  frequencyAM?: string;
  qaMatrixNo?: number;
  qmMatrixNo?: number;
  kaizenType?: string;
  kaizenNo?: string;
  storeroomLocation?: string;
  vendor?: string;
  drawingPicture?: string;
}

interface WCMComponentBOMProps {
  assetId: string;
  assetName: string;
}

export default function WCMComponentBOM({ assetId, assetName }: WCMComponentBOMProps) {
  const { user } = useAuth();
  const [parts, setParts] = useState<AssetPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState<AssetPart | null>(null);

  const [formData, setFormData] = useState({
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
    maintenanceTimeMinutes: 0,
    maintenanceInterval: 0,
    notes: '',
    // WCM Fields
    pmType: '',
    smpNumber: 0,
    frequencyPM: '',
    machineStopRequired: 'STOP',
    inspectionStandard: '',
    frequencyAM: '',
    qaMatrixNo: 0,
    qmMatrixNo: 0,
    kaizenType: '',
    kaizenNo: '',
    storeroomLocation: '',
    vendor: '',
    drawingPicture: '',
  });

  useEffect(() => {
    loadParts();
  }, [assetId]);

  const loadParts = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/assets/${assetId}/parts`);
      setParts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = () => {
    setSelectedPart(null);
    setFormData({
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
      maintenanceTimeMinutes: 0,
      maintenanceInterval: 0,
      notes: '',
      pmType: '',
      smpNumber: 0,
      frequencyPM: '',
      machineStopRequired: 'STOP',
      inspectionStandard: '',
      frequencyAM: '',
      qaMatrixNo: 0,
      qmMatrixNo: 0,
      kaizenType: '',
      kaizenNo: '',
      storeroomLocation: '',
      vendor: '',
      drawingPicture: '',
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assets/parts', {
        assetId,
        ...formData,
        createdById: user?.id,
      });
      setShowAddModal(false);
      loadParts();
    } catch (error: any) {
      alert(`Failed to add part: ${error.message}`);
    }
  };

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Delete this component?')) return;
    try {
      await api.delete(`/assets/parts/${partId}`);
      loadParts();
    } catch (error: any) {
      alert(`Failed to delete part: ${error.message}`);
    }
  };

  const getClassificationBadge = (classification?: string) => {
    if (!classification) return <span className="text-gray-400 text-xs">-</span>;
    const badges: Record<string, { label: string; color: string }> = {
      'A': { label: 'A', color: 'bg-red-600' },
      'B': { label: 'B', color: 'bg-yellow-600' },
      'C': { label: 'C', color: 'bg-green-600' },
    };
    const classUpper = classification.toUpperCase();
    const badge = badges[classUpper] || { label: classification, color: 'bg-gray-400' };
    return (
      <span className={`inline-block w-6 h-6 ${badge.color} text-white text-xs font-bold rounded flex items-center justify-center`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading components...</div>;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">🔧 WCM Component BOM</h2>
          <p className="text-blue-100 text-sm mt-1">{assetName} - {parts.length} Components</p>
        </div>
        <button
          onClick={handleAddPart}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
        >
          + Add Component
        </button>
      </div>

      {/* Components Table */}
      <div className="p-6">
        {parts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <p className="text-gray-600 mb-4">No components defined yet</p>
            <button
              onClick={handleAddPart}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Component
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-2 text-left">Part No.</th>
                  <th className="border px-2 py-2 text-left">Component Name</th>
                  <th className="border px-2 py-2 text-center">ABC</th>
                  <th className="border px-2 py-2">PM Type</th>
                  <th className="border px-2 py-2">Frequency</th>
                  <th className="border px-2 py-2">Duration (min)</th>
                  <th className="border px-2 py-2">Storeroom</th>
                  <th className="border px-2 py-2">Vendor</th>
                  <th className="border px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-2 font-mono text-blue-700">{part.partNumber}</td>
                    <td className="border px-2 py-2 font-semibold">{part.partName}</td>
                    <td className="border px-2 py-2 text-center">{getClassificationBadge(part.componentClassification)}</td>
                    <td className="border px-2 py-2 text-center">{part.pmType || '-'}</td>
                    <td className="border px-2 py-2 text-center">{part.frequencyPM || '-'}</td>
                    <td className="border px-2 py-2 text-center">{part.maintenanceTimeMinutes || '-'}</td>
                    <td className="border px-2 py-2">{part.storeroomLocation || '-'}</td>
                    <td className="border px-2 py-2">{part.vendor || '-'}</td>
                    <td className="border px-2 py-2 text-center">
                      <button
                        onClick={() => handleDeletePart(part.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8">
            <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h3 className="text-xl font-bold">Add WCM Component</h3>
              <button onClick={() => setShowAddModal(false)} className="text-2xl hover:text-gray-300">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">Component Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Part Number *</label>
                    <input
                      type="text"
                      value={formData.partNumber}
                      onChange={(e) => setFormData({...formData, partNumber: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SAP Number</label>
                    <input
                      type="text"
                      value={formData.sapNumber}
                      onChange={(e) => setFormData({...formData, sapNumber: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Component Name *</label>
                    <input
                      type="text"
                      value={formData.partName}
                      onChange={(e) => setFormData({...formData, partName: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor</label>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Storeroom Location</label>
                    <input
                      type="text"
                      value={formData.storeroomLocation}
                      onChange={(e) => setFormData({...formData, storeroomLocation: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">ABC Classification *</label>
                    <select
                      value={formData.componentClassification}
                      onChange={(e) => setFormData({...formData, componentClassification: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="A">A - Critical</option>
                      <option value="B">B - Important</option>
                      <option value="C">C - Standard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Unit of Measure</label>
                    <select
                      value={formData.unitOfMeasure}
                      onChange={(e) => setFormData({...formData, unitOfMeasure: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="EA">EA - Each</option>
                      <option value="PC">PC - Piece</option>
                      <option value="M">M - Meter</option>
                      <option value="KG">KG - Kilogram</option>
                      <option value="L">L - Liter</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PM Section */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-blue-700">PM - Preventive Maintenance</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">PM Type</label>
                    <select
                      value={formData.pmType}
                      onChange={(e) => setFormData({...formData, pmType: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="TBM">TBM - Time Based</option>
                      <option value="CBM">CBM - Condition Based</option>
                      <option value="BDM">BDM - Breakdown</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SMP Number</label>
                    <input
                      type="number"
                      value={formData.smpNumber}
                      onChange={(e) => setFormData({...formData, smpNumber: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">PM Frequency</label>
                    <select
                      value={formData.frequencyPM}
                      onChange={(e) => setFormData({...formData, frequencyPM: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="3M">3M - Quarterly</option>
                      <option value="6M">6M - Semi-Annual</option>
                      <option value="12M">12M - Annual</option>
                      <option value="24M">24M - Biennial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={formData.maintenanceTimeMinutes}
                      onChange={(e) => setFormData({...formData, maintenanceTimeMinutes: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Machine Stop Required</label>
                    <select
                      value={formData.machineStopRequired}
                      onChange={(e) => setFormData({...formData, machineStopRequired: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="STOP">STOP</option>
                      <option value="Running">Running</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AM Section */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-green-700">AM - Autonomous Maintenance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Inspection Standard</label>
                    <input
                      type="text"
                      value={formData.inspectionStandard}
                      onChange={(e) => setFormData({...formData, inspectionStandard: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., C, I, L, T"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">AM Frequency</label>
                    <select
                      value={formData.frequencyAM}
                      onChange={(e) => setFormData({...formData, frequencyAM: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="1W">1W - Weekly</option>
                      <option value="2W">2W - Bi-weekly</option>
                      <option value="M">M - Monthly</option>
                      <option value="3M">3M - Quarterly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* QM Section */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-purple-700">QM - Quality Maintenance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">QA Matrix No.</label>
                    <input
                      type="number"
                      value={formData.qaMatrixNo}
                      onChange={(e) => setFormData({...formData, qaMatrixNo: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">QM Matrix No.</label>
                    <input
                      type="number"
                      value={formData.qmMatrixNo}
                      onChange={(e) => setFormData({...formData, qmMatrixNo: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* FI/Kaizen Section */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2 text-orange-700">FI - Focused Improvement (Kaizen)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kaizen Type</label>
                    <select
                      value={formData.kaizenType}
                      onChange={(e) => setFormData({...formData, kaizenType: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="Cost">Cost Reduction</option>
                      <option value="Reliability">Reliability Improvement</option>
                      <option value="Availability">Availability Improvement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kaizen No.</label>
                    <input
                      type="text"
                      value={formData.kaizenNo}
                      onChange={(e) => setFormData({...formData, kaizenNo: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Add Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
