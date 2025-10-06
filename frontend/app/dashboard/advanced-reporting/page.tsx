'use client';

import { useState } from 'react';

export default function AdvancedReportingPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'builder' | 'scheduled'>('reports');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Reporting</h1>
          <p className="text-gray-600 mt-1">Custom dashboards & KPI tracking</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
          + Create Custom Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Reports</div>
          <div className="text-2xl font-bold text-gray-900">34</div>
          <div className="text-xs text-green-600 mt-1">↑ 5 this month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Custom Dashboards</div>
          <div className="text-2xl font-bold text-blue-600">8</div>
          <div className="text-xs text-gray-500 mt-1">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Scheduled Reports</div>
          <div className="text-2xl font-bold text-purple-600">12</div>
          <div className="text-xs text-gray-500 mt-1">Auto-generated</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Report Views</div>
          <div className="text-2xl font-bold text-green-600">1,247</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'reports', name: 'Report Library', icon: '📊' },
              { id: 'builder', name: 'Report Builder', icon: '🔧' },
              { id: 'scheduled', name: 'Scheduled Reports', icon: '⏰' },
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

        {activeTab === 'reports' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'MTTR Analysis', category: 'Performance', views: 245, lastRun: '2 hours ago' },
                { name: 'Asset Downtime Report', category: 'Assets', views: 189, lastRun: '5 hours ago' },
                { name: 'PM Compliance Dashboard', category: 'Maintenance', views: 412, lastRun: '1 day ago' },
                { name: 'Cost Analysis by Department', category: 'Financial', views: 156, lastRun: '3 days ago' },
                { name: 'Technician Productivity', category: 'Labor', views: 278, lastRun: '1 hour ago' },
                { name: 'Work Order Backlog', category: 'Operations', views: 334, lastRun: '6 hours ago' },
              ].map((report, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {report.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <div>👁️ {report.views} views</div>
                    <div>🕒 Last run: {report.lastRun}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Run Report
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Report Builder</h3>
              <p className="text-gray-600 mb-6">
                Drag-and-drop interface to create custom reports with your data
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-3xl mb-2">📋</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Select Data Sources</h4>
                  <p className="text-xs text-gray-600">Choose from assets, work orders, inventory, etc.</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-3xl mb-2">🎨</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Design Layout</h4>
                  <p className="text-xs text-gray-600">Add charts, tables, and visualizations</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-3xl mb-2">💾</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Save & Schedule</h4>
                  <p className="text-xs text-gray-600">Save report or schedule automatic runs</p>
                </div>
              </div>
              <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                Launch Report Builder
              </button>
            </div>
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Weekly Executive Summary', frequency: 'Weekly (Monday 8am)', recipients: 3, nextRun: '2025-10-07 08:00' },
                { name: 'Monthly Cost Analysis', frequency: 'Monthly (1st day)', recipients: 5, nextRun: '2025-11-01 00:00' },
                { name: 'Daily Work Order Status', frequency: 'Daily (6am)', recipients: 8, nextRun: '2025-10-04 06:00' },
              ].map((schedule, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{schedule.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📅 {schedule.frequency}</span>
                        <span>👥 {schedule.recipients} recipients</span>
                        <span>⏰ Next: {new Date(schedule.nextRun).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Run Now
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        Edit
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
