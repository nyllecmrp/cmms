'use client';

import { useState } from 'react';

export default function CustomFieldsPage() {
  const [activeTab, setActiveTab] = useState<'fields' | 'templates'>('fields');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Fields</h1>
          <p className="text-gray-600 mt-1">Create custom data fields for assets & work orders</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
          + New Custom Field
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Custom Fields</div>
          <div className="text-2xl font-bold text-gray-900">18</div>
          <div className="text-xs text-gray-500 mt-1">Across all modules</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Asset Fields</div>
          <div className="text-2xl font-bold text-blue-600">8</div>
          <div className="text-xs text-gray-500 mt-1">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Work Order Fields</div>
          <div className="text-2xl font-bold text-green-600">7</div>
          <div className="text-xs text-gray-500 mt-1">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Field Templates</div>
          <div className="text-2xl font-bold text-purple-600">5</div>
          <div className="text-xs text-gray-500 mt-1">Reusable</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'fields', name: 'Custom Fields', icon: '📝' },
              { id: 'templates', name: 'Field Templates', icon: '📋' },
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

        {activeTab === 'fields' && (
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Warranty Expiration Date', module: 'Assets', type: 'Date', required: true, active: true },
                { name: 'Serial Number Format', module: 'Assets', type: 'Text', required: false, active: true },
                { name: 'Safety Certification', module: 'Assets', type: 'Dropdown', required: true, active: true },
                { name: 'Downtime Cost', module: 'Work Orders', type: 'Number', required: false, active: true },
                { name: 'Priority Level Custom', module: 'Work Orders', type: 'Dropdown', required: true, active: true },
              ].map((field, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          field.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {field.active ? 'Active' : 'Inactive'}
                        </span>
                        {field.required && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📦 {field.module}</span>
                        <span>🔤 {field.type}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Edit
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Manufacturing Asset', fields: 12, usage: 45 },
                { name: 'Healthcare Equipment', fields: 8, usage: 23 },
                { name: 'Facility Maintenance', fields: 10, usage: 67 },
                { name: 'Vehicle Fleet', fields: 15, usage: 34 },
                { name: 'IT Equipment', fields: 9, usage: 28 },
              ].map((template, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    <div>{template.fields} custom fields</div>
                    <div>Used by {template.usage} assets</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Apply
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
      </div>
    </div>
  );
}
