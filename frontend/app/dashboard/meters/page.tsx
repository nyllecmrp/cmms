'use client';

import { useState } from 'react';

export default function MeterReadingPage() {
  const [activeTab, setActiveTab] = useState<'readings' | 'triggers' | 'schedules'>('readings');
  const [showModal, setShowModal] = useState(false);

  // Mock meter data
  const meters = [
    {
      id: 'meter-1',
      asset: 'Hydraulic Pump #1',
      type: 'Runtime Hours',
      last_reading: 12450,
      reading_date: '2025-10-02',
      threshold: 15000,
      next_pm: 15000,
      status: 'on_track',
      unit: 'hrs',
    },
    {
      id: 'meter-2',
      asset: 'Forklift #3',
      type: 'Odometer',
      last_reading: 8720,
      reading_date: '2025-10-01',
      threshold: 10000,
      next_pm: 10000,
      status: 'approaching',
      unit: 'km',
    },
    {
      id: 'meter-3',
      asset: 'Compressor #2',
      type: 'Cycle Count',
      last_reading: 47823,
      reading_date: '2025-10-03',
      threshold: 50000,
      next_pm: 50000,
      status: 'due_soon',
      unit: 'cycles',
    },
    {
      id: 'meter-4',
      asset: 'Generator #1',
      type: 'Runtime Hours',
      last_reading: 2890,
      reading_date: '2025-09-30',
      threshold: 3000,
      next_pm: 3000,
      status: 'overdue',
      unit: 'hrs',
    },
  ];

  // Mock trigger rules
  const triggers = [
    {
      id: 'trigger-1',
      name: 'Pump PM Every 3000 Hours',
      asset: 'Hydraulic Pump #1',
      meter_type: 'Runtime Hours',
      interval: 3000,
      tolerance: 100,
      action: 'Generate PM Work Order',
      active: true,
      last_triggered: '2024-07-15',
    },
    {
      id: 'trigger-2',
      name: 'Forklift Service at 10K km',
      asset: 'Forklift #3',
      meter_type: 'Odometer',
      interval: 10000,
      tolerance: 500,
      action: 'Email Maintenance Team',
      active: true,
      last_triggered: 'Never',
    },
    {
      id: 'trigger-3',
      name: 'Compressor Inspection Every 50K Cycles',
      asset: 'Compressor #2',
      meter_type: 'Cycle Count',
      interval: 50000,
      tolerance: 1000,
      action: 'Generate Inspection WO',
      active: true,
      last_triggered: '2024-02-20',
    },
  ];

  // Mock reading schedules
  const schedules = [
    {
      id: 'sched-1',
      name: 'Daily Runtime Check',
      assets: ['Hydraulic Pump #1', 'Compressor #2', 'Generator #1'],
      frequency: 'Daily',
      time: '08:00 AM',
      assigned_to: 'Juan Dela Cruz',
      active: true,
    },
    {
      id: 'sched-2',
      name: 'Weekly Vehicle Odometer',
      assets: ['Forklift #3', 'Delivery Truck #1', 'Company Car #2'],
      frequency: 'Weekly',
      time: 'Monday 09:00 AM',
      assigned_to: 'Maria Santos',
      active: true,
    },
    {
      id: 'sched-3',
      name: 'Monthly Cycle Count',
      assets: ['Compressor #2', 'Press Machine #1'],
      frequency: 'Monthly',
      time: '1st of month',
      assigned_to: 'Pedro Reyes',
      active: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-700 bg-green-100';
      case 'approaching': return 'text-yellow-700 bg-yellow-100';
      case 'due_soon': return 'text-orange-700 bg-orange-100';
      case 'overdue': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const calculateProgress = (current: number, threshold: number) => {
    return Math.min((current / threshold) * 100, 100);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meter Reading & Usage Tracking</h1>
        <p className="text-gray-600">Track asset usage and trigger maintenance based on meter readings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Active Meters</div>
          <div className="text-2xl font-bold text-gray-900">47</div>
          <div className="text-xs text-gray-500">12 types tracked</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Due Soon</div>
          <div className="text-2xl font-bold text-orange-600">8</div>
          <div className="text-xs text-gray-500">Within threshold</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Overdue Readings</div>
          <div className="text-2xl font-bold text-red-600">3</div>
          <div className="text-xs text-gray-500">Needs attention</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Auto Triggers</div>
          <div className="text-2xl font-bold text-blue-600">15</div>
          <div className="text-xs text-gray-500">Active rules</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('readings')}
              className={`px-6 py-3 font-medium ${activeTab === 'readings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Meter Readings
            </button>
            <button
              onClick={() => setActiveTab('triggers')}
              className={`px-6 py-3 font-medium ${activeTab === 'triggers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              PM Triggers
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-6 py-3 font-medium ${activeTab === 'schedules' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Reading Schedules
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Meter Readings Tab */}
          {activeTab === 'readings' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Current Meter Readings</h3>
                  <p className="text-sm text-gray-600">Track usage and maintenance thresholds</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Record Reading
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Meter Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Reading</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Next PM At</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {meters.map((meter) => {
                      const progress = calculateProgress(meter.last_reading, meter.threshold);
                      return (
                        <tr key={meter.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{meter.asset}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{meter.type}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {meter.last_reading.toLocaleString()} {meter.unit}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {meter.next_pm.toLocaleString()} {meter.unit}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                                <div
                                  className={`h-2 rounded-full ${progress >= 95 ? 'bg-red-600' : progress >= 80 ? 'bg-orange-500' : 'bg-green-600'}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">{progress.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded ${getStatusColor(meter.status)}`}>
                              {meter.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{meter.reading_date}</td>
                          <td className="px-4 py-3">
                            <button className="text-blue-600 hover:underline text-sm">Update</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-900 mb-2">Meter Types Supported</h4>
                <div className="flex gap-4 text-sm text-blue-800">
                  <span>⏱️ Runtime Hours</span>
                  <span>🚗 Odometer (km/miles)</span>
                  <span>🔄 Cycle Count</span>
                  <span>📊 Production Units</span>
                  <span>⛽ Fuel Consumed</span>
                </div>
              </div>
            </div>
          )}

          {/* PM Triggers Tab */}
          {activeTab === 'triggers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Maintenance Trigger Rules</h3>
                  <p className="text-sm text-gray-600">Automatic PM generation based on meter thresholds</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Trigger
                </button>
              </div>

              <div className="space-y-4">
                {triggers.map((trigger) => (
                  <div key={trigger.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{trigger.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded ${trigger.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {trigger.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{trigger.asset} • {trigger.meter_type}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">Every {trigger.interval.toLocaleString()} units</div>
                        <div className="text-xs text-gray-500">± {trigger.tolerance} tolerance</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Action</div>
                        <div className="text-sm font-medium text-gray-900">{trigger.action}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Last Triggered</div>
                        <div className="text-sm font-medium text-gray-900">{trigger.last_triggered}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="text-sm text-blue-600 hover:underline">Edit</button>
                      <button className="text-sm text-gray-600 hover:underline">Test Trigger</button>
                      <button className="text-sm text-red-600 hover:underline">Deactivate</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded">
                <h4 className="font-semibold text-green-900 mb-2">Trigger Actions Available</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Generate Preventive Maintenance Work Order</li>
                  <li>• Send Email/SMS Notification to Team</li>
                  <li>• Create Inspection Request</li>
                  <li>• Update Asset Status/Flags</li>
                </ul>
              </div>
            </div>
          )}

          {/* Reading Schedules Tab */}
          {activeTab === 'schedules' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Reading Schedules</h3>
                  <p className="text-sm text-gray-600">Automated reminders for meter readings</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Schedule
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded ${schedule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {schedule.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {schedule.frequency} at {schedule.time}
                        </p>
                      </div>
                      <div className="text-sm text-gray-900">
                        Assigned to: <span className="font-medium">{schedule.assigned_to}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1">Assets ({schedule.assets.length})</div>
                      <div className="flex flex-wrap gap-2">
                        {schedule.assets.map((asset, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="text-sm text-blue-600 hover:underline">Edit</button>
                      <button className="text-sm text-gray-600 hover:underline">View History</button>
                      <button className="text-sm text-red-600 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm text-blue-700 font-semibold">Daily Schedules</div>
                  <div className="text-xs text-blue-600">3 active</div>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm text-blue-700 font-semibold">Weekly Schedules</div>
                  <div className="text-xs text-blue-600">2 active</div>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm text-blue-700 font-semibold">Monthly Schedules</div>
                  <div className="text-xs text-blue-600">1 active</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {activeTab === 'readings' ? 'Record Reading' : activeTab === 'triggers' ? 'Create Trigger' : 'Create Schedule'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">Feature coming soon...</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
