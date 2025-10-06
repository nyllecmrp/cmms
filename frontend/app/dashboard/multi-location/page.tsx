'use client';

import { useState } from 'react';

export default function MultiLocationPage() {
  const [activeTab, setActiveTab] = useState<'locations' | 'map' | 'transfer'>('locations');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Multi-Location Management</h1>
          <p className="text-gray-600 mt-1">Manage assets & operations across multiple sites</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
          + Add Location
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Locations</div>
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-xs text-gray-500 mt-1">Across 3 cities</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Assets</div>
          <div className="text-2xl font-bold text-blue-600">1,247</div>
          <div className="text-xs text-gray-500 mt-1">All locations</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Work Orders</div>
          <div className="text-2xl font-bold text-green-600">89</div>
          <div className="text-xs text-gray-500 mt-1">Across sites</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Asset Transfers</div>
          <div className="text-2xl font-bold text-purple-600">23</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'locations', name: 'Locations', icon: '📍' },
              { id: 'map', name: 'Map View', icon: '🗺️' },
              { id: 'transfer', name: 'Asset Transfers', icon: '🔄' },
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

        {activeTab === 'locations' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Main Manufacturing Plant', city: 'Manila', assets: 456, workOrders: 34, status: 'Operational' },
                { name: 'Distribution Center North', city: 'Quezon City', assets: 234, workOrders: 18, status: 'Operational' },
                { name: 'Warehouse South', city: 'Makati', assets: 189, workOrders: 12, status: 'Operational' },
                { name: 'Service Center East', city: 'Pasig', assets: 145, workOrders: 15, status: 'Operational' },
                { name: 'Regional Office Cebu', city: 'Cebu', assets: 98, workOrders: 6, status: 'Operational' },
                { name: 'Satellite Warehouse', city: 'Taguig', assets: 125, workOrders: 4, status: 'Maintenance' },
              ].map((location, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{location.name}</h3>
                      <p className="text-sm text-gray-600">📍 {location.city}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      location.status === 'Operational'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {location.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Assets</span>
                      <span className="font-semibold text-gray-900">{location.assets}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active WOs</span>
                      <span className="font-semibold text-gray-900">{location.workOrders}</span>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Location Map</h3>
              <p className="text-gray-600 mb-6">
                View all your locations on an interactive map with real-time status
              </p>
              <div className="bg-white rounded-lg p-6 border border-gray-200 max-w-4xl mx-auto">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🌏</div>
                    <p>Interactive map would be displayed here</p>
                    <p className="text-sm">Showing 12 locations across Metro Manila and Cebu</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-green-600 font-semibold">● Operational</div>
                  <div className="text-2xl font-bold text-gray-900">10</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-yellow-600 font-semibold">● Maintenance</div>
                  <div className="text-2xl font-bold text-gray-900">2</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-red-600 font-semibold">● Offline</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div className="p-6">
            <div className="mb-6">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                + Request Asset Transfer
              </button>
            </div>
            <div className="space-y-4">
              {[
                {
                  asset: 'Forklift #F-234',
                  from: 'Main Manufacturing Plant',
                  to: 'Warehouse South',
                  requestedBy: 'Juan Cruz',
                  date: '2025-10-05',
                  status: 'Pending Approval',
                },
                {
                  asset: 'Pallet Jack #PJ-089',
                  from: 'Distribution Center North',
                  to: 'Service Center East',
                  requestedBy: 'Maria Santos',
                  date: '2025-10-03',
                  status: 'In Transit',
                },
                {
                  asset: 'Compressor Unit',
                  from: 'Warehouse South',
                  to: 'Main Manufacturing Plant',
                  requestedBy: 'Pedro Garcia',
                  date: '2025-10-01',
                  status: 'Completed',
                },
              ].map((transfer, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{transfer.asset}</h3>
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div>📤 From: {transfer.from}</div>
                        <div>📥 To: {transfer.to}</div>
                        <div>👤 Requested by: {transfer.requestedBy}</div>
                        <div>📅 Date: {new Date(transfer.date).toLocaleDateString()}</div>
                      </div>
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        transfer.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        transfer.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transfer.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {transfer.status === 'Pending Approval' && (
                        <>
                          <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                            Approve
                          </button>
                          <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                            Reject
                          </button>
                        </>
                      )}
                      {transfer.status === 'In Transit' && (
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                          Track
                        </button>
                      )}
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
