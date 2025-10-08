'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface PMSchedule {
  id: string;
  name: string;
  assetId: string;
  assetName: string;
  frequency: string;
  frequencyValue: number;
  lastCompleted?: string;
  nextDue: string;
  status: string;
  assignedTo?: string;
  priority: string;
}

interface Asset {
  id: string;
  name: string;
  assetNumber: string;
  category: string;
}

export default function PreventiveMaintenancePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<PMSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    assetId: '',
    frequency: 'daily',
    frequencyValue: 1,
    assignedTo: '',
    priority: 'medium',
    tasks: '',
    parts: '',
  });

  useEffect(() => {
    // Mock PM schedules data
    const mockSchedules: PMSchedule[] = [
      {
        id: '1',
        name: 'Monthly Hydraulic Pump Inspection',
        assetId: 'asset-1',
        assetName: 'Hydraulic Pump Unit A',
        frequency: 'monthly',
        frequencyValue: 1,
        lastCompleted: '2025-09-03',
        nextDue: '2025-10-03',
        status: 'due_soon',
        assignedTo: 'John Doe',
        priority: 'high',
      },
      {
        id: '2',
        name: 'Weekly Generator Oil Check',
        assetId: 'asset-2',
        assetName: 'Backup Generator',
        frequency: 'weekly',
        frequencyValue: 1,
        lastCompleted: '2025-09-26',
        nextDue: '2025-10-10',
        status: 'scheduled',
        assignedTo: 'Maria Santos',
        priority: 'medium',
      },
      {
        id: '3',
        name: 'Quarterly HVAC Filter Replacement',
        assetId: 'asset-3',
        assetName: 'HVAC Unit - Floor 2',
        frequency: 'quarterly',
        frequencyValue: 3,
        lastCompleted: '2025-07-01',
        nextDue: '2025-10-01',
        status: 'overdue',
        assignedTo: 'Juan Cruz',
        priority: 'urgent',
      },
    ];

    setSchedules(mockSchedules);
    setLoading(false);
  }, []);

  // Fetch assets when modal opens
  useEffect(() => {
    if (isFormOpen && user?.organizationId) {
      const fetchAssets = async () => {
        try {
          const data = await api.getAssets(user.organizationId);
          setAssets(data as Asset[]);
        } catch (error) {
          console.error('Failed to fetch assets:', error);
        }
      };
      fetchAssets();
    }
  }, [isFormOpen, user?.organizationId]);

  const filteredSchedules = schedules.filter((schedule) => {
    if (filterStatus === 'all') return true;
    return schedule.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'due_soon': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement PM schedule creation API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newSchedule: PMSchedule = {
        id: Date.now().toString(),
        name: formData.name,
        assetId: formData.assetId,
        assetName: 'Asset Name', // Would come from asset lookup
        frequency: formData.frequency,
        frequencyValue: formData.frequencyValue,
        nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'scheduled',
        assignedTo: formData.assignedTo,
        priority: formData.priority,
      };

      setSchedules([...schedules, newSchedule]);
      setIsFormOpen(false);
      setFormData({
        name: '',
        assetId: '',
        frequency: 'daily',
        frequencyValue: 1,
        assignedTo: '',
        priority: 'medium',
        tasks: '',
        parts: '',
      });
    } catch (err) {
      console.error('Failed to create PM schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PM schedule?')) return;

    try {
      setSchedules(schedules.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  };

  const handleGenerateWorkOrder = async (scheduleId: string) => {
    try {
      // TODO: Implement work order generation from PM schedule
      alert('Work order generated successfully!');
    } catch (err) {
      console.error('Failed to generate work order:', err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔄 Preventive Maintenance</h1>
          <p className="text-gray-600 mt-1">Schedule and manage routine maintenance tasks</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          + Create PM Schedule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Total Schedules</div>
          <div className="text-2xl font-bold text-gray-900">{schedules.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600">Due Soon</div>
          <div className="text-2xl font-bold text-yellow-600">
            {schedules.filter(s => s.status === 'due_soon').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600">Overdue</div>
          <div className="text-2xl font-bold text-red-600">
            {schedules.filter(s => s.status === 'overdue').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Completed This Month</div>
          <div className="text-2xl font-bold text-green-600">12</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="due_soon">Due Soon</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
            <option>All Frequencies</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Annually</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
            <option>All Priorities</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* PM Schedules Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading PM schedules...</div>
        ) : filteredSchedules.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No PM schedules found</h3>
            <p className="text-gray-600 mb-4">Create your first preventive maintenance schedule.</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Create PM Schedule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    PM Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Next Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{schedule.assetName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">
                        {schedule.frequency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {schedule.lastCompleted ? new Date(schedule.lastCompleted).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">
                        {new Date(schedule.nextDue).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                        {schedule.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(schedule.priority)}`}>
                        {schedule.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{schedule.assignedTo || 'Unassigned'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleGenerateWorkOrder(schedule.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Generate WO
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-red-600 hover:text-red-800"
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

      {/* Create PM Schedule Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsFormOpen(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleCreateSchedule}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Create PM Schedule</h3>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schedule Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        placeholder="e.g., Monthly Pump Inspection"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frequency *
                        </label>
                        <select
                          value={formData.frequency}
                          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          required
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="annually">Annually</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority *
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          required
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asset
                        {assets.length > 0 && (
                          <span className="text-xs text-green-600 ml-2">
                            ({assets.length} assets loaded)
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Type to search assets..."
                          value={selectedAsset ? `${selectedAsset.name} (${selectedAsset.assetNumber})` : assetSearch}
                          onChange={(e) => {
                            setAssetSearch(e.target.value);
                            setSelectedAsset(null);
                            setShowAssetDropdown(true);
                            setFormData({ ...formData, assetId: '' });
                          }}
                          onFocus={() => setShowAssetDropdown(true)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        {selectedAsset && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAsset(null);
                              setAssetSearch('');
                              setShowAssetDropdown(true);
                              setFormData({ ...formData, assetId: '' });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      
                      {/* Asset Dropdown */}
                      {showAssetDropdown && !selectedAsset && (
                        <>
                          {/* Invisible overlay to close dropdown when clicking outside */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowAssetDropdown(false)}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {assets.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                Loading assets...
                              </div>
                            ) : assets.filter(asset => 
                              assetSearch === '' ||
                              asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
                              asset.assetNumber.toLowerCase().includes(assetSearch.toLowerCase()) ||
                              asset.category.toLowerCase().includes(assetSearch.toLowerCase())
                            ).length > 0 ? (
                              assets
                                .filter(asset => 
                                  assetSearch === '' ||
                                  asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                  asset.assetNumber.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                  asset.category.toLowerCase().includes(assetSearch.toLowerCase())
                                )
                                .map((asset) => (
                                  <button
                                    key={asset.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedAsset(asset);
                                      setAssetSearch('');
                                      setShowAssetDropdown(false);
                                      setFormData({ ...formData, assetId: asset.id });
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {asset.assetNumber} • {asset.category}
                                    </div>
                                  </button>
                                ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No assets found matching &quot;{assetSearch}&quot;
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned To
                      </label>
                      <input
                        type="text"
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Select technician..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tasks (one per line)
                      </label>
                      <textarea
                        value={formData.tasks}
                        onChange={(e) => setFormData({ ...formData, tasks: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Inspect oil level&#10;Check for leaks&#10;Test pressure"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Required Parts
                      </label>
                      <input
                        type="text"
                        value={formData.parts}
                        onChange={(e) => setFormData({ ...formData, parts: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Oil filter, Grease, etc."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                  >
                    {loading ? 'Creating...' : 'Create Schedule'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
