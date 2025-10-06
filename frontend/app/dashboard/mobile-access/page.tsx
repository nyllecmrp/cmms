'use client';

import { useState } from 'react';

export default function MobileAccessPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'users'>('overview');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mobile Access</h1>
        <p className="text-gray-600 mt-1">Mobile app management & offline capabilities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Mobile Users</div>
          <div className="text-2xl font-bold text-gray-900">28</div>
          <div className="text-xs text-green-600 mt-1">↑ 4 this week</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Mobile WOs Completed</div>
          <div className="text-2xl font-bold text-blue-600">134</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Offline Syncs</div>
          <div className="text-2xl font-bold text-purple-600">1,247</div>
          <div className="text-xs text-gray-500 mt-1">Last 7 days</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Avg Response Time</div>
          <div className="text-2xl font-bold text-green-600">12m</div>
          <div className="text-xs text-green-600 mt-1">↓ 8% vs last month</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', name: 'Overview', icon: '📱' },
              { id: 'features', name: 'Features', icon: '⚡' },
              { id: 'users', name: 'Mobile Users', icon: '👥' },
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Download Mobile App</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Get the CMMS mobile app for iOS and Android
                </p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50">
                    🍎 App Store
                  </button>
                  <button className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50">
                    🤖 Google Play
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Downloads</span>
                    <span className="text-sm font-semibold text-gray-900">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active This Week</span>
                    <span className="text-sm font-semibold text-gray-900">28</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">iOS Users</span>
                    <span className="text-sm font-semibold text-gray-900">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Android Users</span>
                    <span className="text-sm font-semibold text-gray-900">16</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mobile Activity</h3>
              <div className="space-y-3">
                {[
                  { user: 'Juan Cruz', action: 'Completed WO #4521', time: '5 minutes ago', device: 'Android' },
                  { user: 'Maria Santos', action: 'Updated asset location', time: '12 minutes ago', device: 'iOS' },
                  { user: 'Pedro Garcia', action: 'Added photo to WO #4518', time: '23 minutes ago', device: 'Android' },
                  { user: 'Ana Lopez', action: 'Scanned asset QR code', time: '1 hour ago', device: 'iOS' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{item.user}</div>
                      <div className="text-xs text-gray-500">{item.action}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{item.time}</div>
                      <div className="text-xs text-gray-400">{item.device}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '📴', title: 'Offline Mode', desc: 'Work without internet, auto-sync when connected', status: 'active' },
                { icon: '📸', title: 'Photo Capture', desc: 'Take and attach photos to work orders', status: 'active' },
                { icon: '📍', title: 'GPS Tracking', desc: 'Track technician location and asset navigation', status: 'active' },
                { icon: '🔔', title: 'Push Notifications', desc: 'Real-time alerts for new assignments', status: 'active' },
                { icon: '🎤', title: 'Voice-to-Text', desc: 'Dictate notes and work order updates', status: 'premium' },
                { icon: '📊', title: 'Barcode Scanning', desc: 'Scan asset barcodes and QR codes', status: 'active' },
                { icon: '✍️', title: 'Digital Signature', desc: 'Capture signatures for work completion', status: 'active' },
                { icon: '🗺️', title: 'Asset Maps', desc: 'Interactive facility maps with asset locations', status: 'premium' },
                { icon: '⏱️', title: 'Time Tracking', desc: 'Track labor hours on work orders', status: 'active' },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{feature.icon}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      feature.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {feature.status === 'active' ? 'Active' : 'Premium'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✨</div>
                <div>
                  <div className="text-sm font-semibold text-purple-900 mb-1">Premium Features</div>
                  <div className="text-sm text-purple-800">
                    Upgrade to Enterprise plan to unlock voice-to-text and interactive asset maps
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Users Tab */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      App Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { name: 'Juan Cruz', device: 'Android 13', lastActive: '5 min ago', version: 'v2.1.4', status: 'Online' },
                    { name: 'Maria Santos', device: 'iOS 17', lastActive: '12 min ago', version: 'v2.1.4', status: 'Online' },
                    { name: 'Pedro Garcia', device: 'Android 12', lastActive: '2 hours ago', version: 'v2.1.3', status: 'Offline' },
                    { name: 'Ana Lopez', device: 'iOS 16', lastActive: '3 hours ago', version: 'v2.1.4', status: 'Offline' },
                  ].map((user, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold mr-3 text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{user.device}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{user.lastActive}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{user.version}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'Online'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">
                          View Activity
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
