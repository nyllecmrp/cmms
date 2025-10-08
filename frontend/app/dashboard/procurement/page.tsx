'use client';

import { useState } from 'react';

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'requests' | 'vendors'>('orders');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement</h1>
          <p className="text-gray-600 mt-1">Purchase orders & vendor management</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
          + New Purchase Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Open Orders</div>
          <div className="text-2xl font-bold text-blue-600">18</div>
          <div className="text-xs text-gray-500 mt-1">Pending approval</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Spend (YTD)</div>
          <div className="text-2xl font-bold text-gray-900">$124,567</div>
          <div className="text-xs text-green-600 mt-1">↓ 5% vs last year</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Vendors</div>
          <div className="text-2xl font-bold text-purple-600">42</div>
          <div className="text-xs text-gray-500 mt-1">Verified</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Avg Processing Time</div>
          <div className="text-2xl font-bold text-orange-600">3.2 days</div>
          <div className="text-xs text-green-600 mt-1">↓ 0.5 days</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'orders', name: 'Purchase Orders', icon: '🛒' },
              { id: 'requests', name: 'Purchase Requests', icon: '📋' },
              { id: 'vendors', name: 'Vendor Management', icon: '🏢' },
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

        <div className="p-6">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {[
                { id: 'PO-2024-128', vendor: 'Industrial Supplies Co', items: 5, total: '$4,250', status: 'Pending', date: '2024-10-05' },
                { id: 'PO-2024-127', vendor: 'Tech Equipment Ltd', items: 3, total: '$12,800', status: 'Approved', date: '2024-10-03' },
                { id: 'PO-2024-126', vendor: 'Safety Gear Plus', items: 12, total: '$1,450', status: 'Delivered', date: '2024-10-01' },
                { id: 'PO-2024-125', vendor: 'Maintenance Parts Inc', items: 8, total: '$3,200', status: 'In Transit', date: '2024-09-28' },
              ].map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          order.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>🏢 {order.vendor}</span>
                        <span>📦 {order.items} items</span>
                        <span>💰 {order.total}</span>
                        <span>📅 {order.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        View Details
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        Track
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Requests</h3>
              <p className="text-gray-600 mb-4">
                Submit and track purchase requests for materials and equipment
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-2xl font-bold text-yellow-600">8</div>
                  <div className="text-sm text-gray-600">Pending Approval</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-2xl font-bold text-green-600">15</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-2xl font-bold text-blue-600">45</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                Submit New Request
              </button>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Industrial Supplies Co', rating: 4.8, orders: 23, status: 'Preferred' },
                { name: 'Tech Equipment Ltd', rating: 4.5, orders: 18, status: 'Active' },
                { name: 'Safety Gear Plus', rating: 4.9, orders: 34, status: 'Preferred' },
                { name: 'Maintenance Parts Inc', rating: 4.3, orders: 12, status: 'Active' },
                { name: 'Tools & Hardware Co', rating: 4.6, orders: 28, status: 'Active' },
                { name: 'Electronics Supply Hub', rating: 4.7, orders: 15, status: 'Active' },
              ].map((vendor, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{vendor.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center justify-between">
                      <span>Rating:</span>
                      <span className="font-semibold text-yellow-600">⭐ {vendor.rating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Orders:</span>
                      <span className="font-semibold">{vendor.orders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        vendor.status === 'Preferred' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {vendor.status}
                      </span>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

