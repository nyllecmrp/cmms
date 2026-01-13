'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import AssetForm from '@/components/AssetForm';
import AssetPartsManager from '@/components/AssetPartsManager';
import RoleGuard from '@/components/RoleGuard';
import { canPerformAction } from '@/lib/rolePermissions';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface Asset {
  id: string;
  assetNumber: string;
  name: string;
  category: string;
  status: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
}

export default function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [maintenanceHistory, setMaintenanceHistory] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedTimelineItems, setExpandedTimelineItems] = useState<Set<string>>(new Set());
  const [showPartsManager, setShowPartsManager] = useState(false);
  const [partsManagerAsset, setPartsManagerAsset] = useState<Asset | null>(null);

  const canCreate = canPerformAction(user?.roleId || null, 'create');
  const canEdit = canPerformAction(user?.roleId || null, 'edit');
  const canDelete = canPerformAction(user?.roleId || null, 'delete');

  // ESC key handlers for modals
  useEscapeKey(() => setShowHistoryModal(false), showHistoryModal);
  useEscapeKey(() => setShowPartsManager(false), showPartsManager);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get organization ID from localStorage
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const organizationId = user?.organizationId || 'org-test-1';

        // Fetch real data from backend API
        const data = await api.getAssets(organizationId);
        setAssets(data as Asset[]);
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch assets:', error);
        setError(error.message || 'Failed to load assets');
        setLoading(false);
        // Show fallback mock data
        setAssets([
          {
            id: '1',
            assetNumber: 'PUMP-001',
            name: 'Hydraulic Pump Unit A',
            category: 'Equipment',
            status: 'operational',
          },
          {
            id: '2',
            assetNumber: 'MED-CT-001',
            name: 'CT Scanner - Radiology',
            category: 'Equipment',
            status: 'operational',
          },
        ]);
      }
    };

    fetchAssets();
  }, []);

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.assetNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setIsFormOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsFormOpen(true);
  };

  const handleViewHistory = async (asset: Asset) => {
    setLoadingHistory(true);
    setShowHistoryModal(true);
    try {
      const history = await api.getAssetMaintenanceHistory(asset.id);
      setMaintenanceHistory(history);
    } catch (error: any) {
      alert(`Failed to load maintenance history: ${error.message}`);
      setShowHistoryModal(false);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleManageParts = (asset: Asset) => {
    setPartsManagerAsset(asset);
    setShowPartsManager(true);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const organizationId = user?.organizationId || 'org-test-1';

      await api.deleteAsset(assetId, organizationId);

      // Refresh asset list
      const data = await api.getAssets(organizationId);
      setAssets(data as Asset[]);
    } catch (error: any) {
      alert(`Failed to delete asset: ${error.message}`);
    }
  };

  const handleFormSuccess = async () => {
    // Refresh asset list
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const organizationId = user?.organizationId || 'org-test-1';

    const data = await api.getAssets(organizationId);
    setAssets(data as Asset[]);
  };

  return (
    <RoleGuard requiredModule="assets">
      <div>
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ⚠️ {error} - Showing cached data. Backend may not be connected.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
            <p className="text-gray-600 mt-1">Manage your equipment and facilities</p>
          </div>
          {canCreate && (
            <button
              onClick={handleAddAsset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Add New Asset
            </button>
          )}
        </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
            <option>All Status</option>
            <option>Operational</option>
            <option>Down</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-600 mb-4">Start by adding your first asset to the system.</p>
            {canCreate && (
              <button 
                onClick={handleAddAsset}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + Add Your First Asset
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">{asset.assetNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/dashboard/assets/${asset.id}/machine-ledger`}
                        className="text-purple-600 hover:text-purple-800 mr-3 font-medium"
                        title="Machine Ledger (WCM)"
                      >
                        📋 Ledger
                      </Link>
                      <button
                        onClick={() => handleManageParts(asset)}
                        className="text-green-600 hover:text-green-800 mr-3 font-medium"
                        title="Manage Parts"
                      >
                        🔧 Parts
                      </button>
                      <button
                        onClick={() => handleViewHistory(asset)}
                        className="text-blue-600 hover:text-blue-800 mr-3 font-medium"
                        title="View Maintenance History"
                      >
                        📊 History
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleEditAsset(asset)}
                          className="text-gray-600 hover:text-gray-800 mr-3"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      )}
                      {!canEdit && !canDelete && (
                        <span className="text-gray-400 text-xs">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Assets</div>
          <div className="text-2xl font-bold text-gray-900">{assets.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Operational</div>
          <div className="text-2xl font-bold text-green-600">
            {assets.filter(a => a.status === 'operational').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Under Maintenance</div>
          <div className="text-2xl font-bold text-yellow-600">
            {assets.filter(a => a.status === 'maintenance').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Down</div>
          <div className="text-2xl font-bold text-red-600">
            {assets.filter(a => a.status === 'down').length}
          </div>
        </div>
      </div>

        <AssetForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          asset={selectedAsset}
        />

        {/* Maintenance History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={() => setShowHistoryModal(false)}
              ></div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                <div className="bg-white px-6 pt-5 pb-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Maintenance History</h2>
                      {maintenanceHistory && (
                        <p className="text-sm text-gray-600 mt-1">
                          {maintenanceHistory.asset.name} ({maintenanceHistory.asset.assetNumber})
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/assets/${maintenanceHistory?.asset.id}/history`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        View Full Report
                      </Link>
                      <button
                        onClick={() => setShowHistoryModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="text-2xl">&times;</span>
                      </button>
                    </div>
                  </div>

                  {loadingHistory ? (
                    <div className="py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading maintenance history...</p>
                    </div>
                  ) : maintenanceHistory ? (
                    <div className="space-y-6">
                      {/* Asset Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Manufacturer</p>
                            <p className="text-sm font-medium text-gray-900">{maintenanceHistory.asset.manufacturer || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Model</p>
                            <p className="text-sm font-medium text-gray-900">{maintenanceHistory.asset.model || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Serial Number</p>
                            <p className="text-sm font-medium text-gray-900">{maintenanceHistory.asset.serialNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(maintenanceHistory.asset.status)}`}>
                              {maintenanceHistory.asset.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Statistics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <p className="text-xs text-gray-500">Total Work Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{maintenanceHistory.statistics.totalWorkOrders}</p>
                          <p className="text-xs text-green-600 mt-1">{maintenanceHistory.statistics.completedWorkOrders} completed</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <p className="text-xs text-gray-500">Maintenance Cost</p>
                          <p className="text-2xl font-bold text-gray-900">₱{maintenanceHistory.statistics.totalMaintenanceCost.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{maintenanceHistory.statistics.totalMaintenanceHours}h total</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <p className="text-xs text-gray-500">MTBF (Days)</p>
                          <p className="text-2xl font-bold text-blue-600">{maintenanceHistory.statistics.mtbf || 'N/A'}</p>
                          <p className="text-xs text-gray-500 mt-1">Between failures</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <p className="text-xs text-gray-500">MTTR (Hours)</p>
                          <p className="text-2xl font-bold text-orange-600">{maintenanceHistory.statistics.mttr || 'N/A'}</p>
                          <p className="text-xs text-gray-500 mt-1">Avg repair time</p>
                        </div>
                      </div>

                      {/* Timeline Preview */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {maintenanceHistory.timeline.slice(0, 10).map((event: any, index: number) => {
                            const eventKey = `${event.type}-${event.id}-${index}`;
                            const isExpanded = expandedTimelineItems.has(eventKey);

                            return (
                              <div key={eventKey} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                                {/* Collapsed Header - Always Visible */}
                                <div
                                  onClick={() => {
                                    const newSet = new Set(expandedTimelineItems);
                                    if (isExpanded) {
                                      newSet.delete(eventKey);
                                    } else {
                                      newSet.add(eventKey);
                                    }
                                    setExpandedTimelineItems(newSet);
                                  }}
                                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                                >
                                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${
                                    event.type === 'work_order' ? 'bg-blue-500' : 'bg-green-500'
                                  }`}>
                                    {event.type === 'work_order' ? '🔧' : '✓'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                        <span className="text-gray-400">
                                          {isExpanded ? '▼' : '▶'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      {event.workOrderNumber && (
                                        <span className="text-xs text-blue-600 font-medium">{event.workOrderNumber}</span>
                                      )}
                                      {event.workOrderType && (
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                          event.workOrderType === 'preventive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                          {event.workOrderType}
                                        </span>
                                      )}
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        event.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        event.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {event.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded Details - Shows on Click */}
                                {isExpanded && (
                                  <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
                                    {/* Basic Info Grid */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span className="text-gray-500">Assigned To:</span>
                                        <span className="ml-2 font-medium text-gray-900">{event.assignedTo}</span>
                                      </div>
                                      {event.cost > 0 && (
                                        <div>
                                          <span className="text-gray-500">Cost:</span>
                                          <span className="ml-2 font-medium text-gray-900">₱{event.cost.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {event.hours > 0 && (
                                        <div>
                                          <span className="text-gray-500">Hours:</span>
                                          <span className="ml-2 font-medium text-gray-900">{event.hours}h</span>
                                        </div>
                                      )}
                                      {event.frequency && (
                                        <div>
                                          <span className="text-gray-500">Frequency:</span>
                                          <span className="ml-2 font-medium text-gray-900">{event.frequency}</span>
                                        </div>
                                      )}
                                      {event.priority && (
                                        <div>
                                          <span className="text-gray-500">Priority:</span>
                                          <span className={`ml-2 font-medium ${
                                            event.priority === 'high' ? 'text-red-600' :
                                            event.priority === 'medium' ? 'text-yellow-600' :
                                            'text-green-600'
                                          }`}>
                                            {event.priority}
                                          </span>
                                        </div>
                                      )}
                                      {event.componentClassification && (
                                        <div>
                                          <span className="text-gray-500">Component Type:</span>
                                          <span className="ml-2 font-medium text-blue-600">{event.componentClassification}</span>
                                        </div>
                                      )}
                                      {event.maintenanceTimeMinutes && (
                                        <div>
                                          <span className="text-gray-500">Maintenance Time:</span>
                                          <span className="ml-2 font-medium text-gray-900">{event.maintenanceTimeMinutes} min</span>
                                        </div>
                                      )}
                                      {event.activityFrequencyWeeks && (
                                        <div>
                                          <span className="text-gray-500">Activity Frequency:</span>
                                          <span className="ml-2 font-medium text-gray-900">{event.activityFrequencyWeeks} weeks</span>
                                        </div>
                                      )}
                                      {event.basedOnMachineCycle && (
                                        <div>
                                          <span className="text-gray-500">Cycle-Based:</span>
                                          <span className="ml-2 font-medium text-green-600">Yes ({event.machineCycleInterval} hrs)</span>
                                        </div>
                                      )}
                                      {event.machineHoursAtMaintenance && (
                                        <div>
                                          <span className="text-gray-500">Machine Hours:</span>
                                          <span className="ml-2 font-medium text-gray-900">{event.machineHoursAtMaintenance} hrs</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Description */}
                                    {event.description && (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Description:</p>
                                        <p className="text-sm text-gray-700">{event.description}</p>
                                      </div>
                                    )}

                                    {/* Notes */}
                                    {event.notes && (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Notes:</p>
                                        <p className="text-sm text-gray-700 italic">{event.notes}</p>
                                      </div>
                                    )}

                                    {/* Parts Used in Work Order */}
                                    {event.partsUsed && event.partsUsed.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-2">Parts Used in This Work Order:</p>
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-xs border border-gray-300">
                                            <thead className="bg-gray-100">
                                              <tr>
                                                <th className="border border-gray-300 px-2 py-1 text-left">Part Number</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left">Part Name</th>
                                                <th className="border border-gray-300 px-2 py-1 text-left">Manufacturer</th>
                                                <th className="border border-gray-300 px-2 py-1 text-center">Qty Planned</th>
                                                <th className="border border-gray-300 px-2 py-1 text-center">Qty Used</th>
                                                <th className="border border-gray-300 px-2 py-1 text-right">Unit Cost</th>
                                                <th className="border border-gray-300 px-2 py-1 text-right">Total Cost</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {event.partsUsed.map((part: any, partIdx: number) => (
                                                <tr key={partIdx} className="hover:bg-gray-50">
                                                  <td className="border border-gray-300 px-2 py-1 font-mono text-blue-700">{part.partNumber || 'N/A'}</td>
                                                  <td className="border border-gray-300 px-2 py-1 font-medium">{part.partName || 'N/A'}</td>
                                                  <td className="border border-gray-300 px-2 py-1">{part.manufacturer || '-'}</td>
                                                  <td className="border border-gray-300 px-2 py-1 text-center">{part.quantityPlanned || 0}</td>
                                                  <td className="border border-gray-300 px-2 py-1 text-center font-semibold">{part.quantityUsed || 0}</td>
                                                  <td className="border border-gray-300 px-2 py-1 text-right">₱{(part.unitCost || 0).toLocaleString()}</td>
                                                  <td className="border border-gray-300 px-2 py-1 text-right font-semibold text-blue-700">₱{(part.totalCost || 0).toLocaleString()}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}

                                    {/* Parts Required (PM Schedule) */}
                                    {event.parts && event.parts.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-2">Parts Required (PM Schedule):</p>
                                        <div className="space-y-2">
                                          {event.parts.map((part: any, partIdx: number) => (
                                            <div key={partIdx} className="flex items-center justify-between bg-white border border-blue-100 rounded px-3 py-2">
                                              <div>
                                                <span className="text-sm font-medium text-gray-900">{part.name}</span>
                                                <span className="text-xs text-gray-500 ml-2">Qty: {part.quantity}</span>
                                              </div>
                                              <span className="text-sm font-semibold text-blue-700">
                                                ₱{(part.estimatedCost || part.price || 0).toLocaleString()}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {maintenanceHistory.timeline.length > 10 && (
                            <div className="text-center py-3">
                              <Link
                                href={`/dashboard/assets/${maintenanceHistory.asset.id}/history`}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View all {maintenanceHistory.timeline.length} events →
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-500">
                      No maintenance history available
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Asset Parts Manager Modal */}
        {showPartsManager && partsManagerAsset && (
          <AssetPartsManager
            assetId={partsManagerAsset.id}
            assetName={`${partsManagerAsset.assetNumber} - ${partsManagerAsset.name}`}
            onClose={() => {
              setShowPartsManager(false);
              setPartsManagerAsset(null);
            }}
          />
        )}
      </div>
    </RoleGuard>
  );
}
