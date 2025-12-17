'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface PMSchedule {
  id: string;
  title: string;
  assetName: string;
  frequency: string;
  lastCompleted: string;
  nextDue: string;
  status: 'On Track' | 'Due Soon' | 'Overdue';
  assignedTo: string;
  estimatedDuration: string;
}

interface Asset {
  id: string;
  name: string;
  assetNumber: string;
  category: string;
}

export default function PreventiveMaintenancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedules' | 'calendar' | 'compliance'>('schedules');
  const [showAddModal, setShowAddModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [schedules] = useState<PMSchedule[]>([
    {
      id: '1',
      title: 'Monthly Motor Inspection',
      assetName: 'Conveyor Motor A1',
      frequency: 'Monthly',
      lastCompleted: '2025-09-03',
      nextDue: '2025-10-03',
      status: 'On Track',
      assignedTo: 'Maria Santos',
      estimatedDuration: '2 hours',
    },
    {
      id: '2',
      title: 'Quarterly HVAC Filter Change',
      assetName: 'HVAC Unit 5',
      frequency: 'Quarterly',
      lastCompleted: '2025-07-15',
      nextDue: '2025-10-15',
      status: 'Due Soon',
      assignedTo: 'Juan Cruz',
      estimatedDuration: '1 hour',
    },
    {
      id: '3',
      title: 'Annual Pump Overhaul',
      assetName: 'Water Pump #3',
      frequency: 'Annually',
      lastCompleted: '2024-09-20',
      nextDue: '2025-09-20',
      status: 'Overdue',
      assignedTo: 'Unassigned',
      estimatedDuration: '4 hours',
    },
  ]);

  // Fetch assets when modal opens
  useEffect(() => {
    if (showAddModal && user?.organizationId) {
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
  }, [showAddModal, user?.organizationId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'bg-green-100 text-green-800';
      case 'Due Soon': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preventive Maintenance</h1>
          <p className="text-gray-600 mt-1">Scheduled maintenance & PM compliance</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          + New PM Schedule
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total PM Schedules</div>
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-xs text-green-600 mt-1">↑ 3 this month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Due This Week</div>
          <div className="text-2xl font-bold text-yellow-600">8</div>
          <div className="text-xs text-gray-500 mt-1">2 overdue</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Compliance Rate</div>
          <div className="text-2xl font-bold text-green-600">94%</div>
          <div className="text-xs text-green-600 mt-1">↑ 2% vs last month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Auto-Generated WOs</div>
          <div className="text-2xl font-bold text-blue-600">156</div>
          <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'schedules', name: 'PM Schedules', icon: '📋' },
              { id: 'calendar', name: 'Calendar View', icon: '📅' },
              { id: 'compliance', name: 'Compliance', icon: '✓' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* PM Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      PM Title
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
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{schedule.title}</div>
                        <div className="text-xs text-gray-500">{schedule.estimatedDuration}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{schedule.assetName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{schedule.frequency}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(schedule.lastCompleted).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {new Date(schedule.nextDue).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{schedule.assignedTo}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">
                          Generate WO
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar View Tab */}
        {activeTab === 'calendar' && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar View</h3>
              <p className="text-gray-600">
                Visual calendar showing all upcoming PM schedules by date and technician
              </p>
              <div className="mt-6 grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-xs font-semibold text-gray-500 mb-2">{day}</div>
                    <div className="text-sm text-gray-700">
                      {Math.floor(Math.random() * 5)} PMs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">On-Time Completion</span>
                      <span className="text-sm font-semibold text-green-600">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Due This Month</span>
                      <span className="text-sm font-semibold text-blue-600">12/15</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Overdue</span>
                      <span className="text-sm font-semibold text-red-600">3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance by Asset Type</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Motors', compliance: 98, total: 15 },
                    { type: 'HVAC Systems', compliance: 92, total: 8 },
                    { type: 'Pumps', compliance: 85, total: 12 },
                    { type: 'Electrical', compliance: 90, total: 10 },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.type}</div>
                        <div className="text-xs text-gray-500">{item.total} assets</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{item.compliance}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add PM Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowAddModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Create PM Schedule</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PM Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Monthly motor inspection"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Asset * 
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
                      Frequency *
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Quarterly</option>
                      <option>Semi-Annually</option>
                      <option>Annually</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign To
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
                      <option>Select technician...</option>
                      <option>Maria Santos</option>
                      <option>Juan Cruz</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      placeholder="2 hours"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Create Schedule
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition mt-3 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
