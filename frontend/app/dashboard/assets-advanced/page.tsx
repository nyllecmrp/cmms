'use client';

import { useState } from 'react';

export default function AssetsAdvancedPage() {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'criticality' | 'genealogy'>('hierarchy');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock asset hierarchy data
  const assetHierarchy = [
    {
      id: 'plant-1',
      name: 'Manufacturing Plant 1',
      type: 'Facility',
      criticality: 'high',
      children: [
        {
          id: 'line-1',
          name: 'Production Line A',
          type: 'System',
          criticality: 'high',
          children: [
            { id: 'pump-1', name: 'Hydraulic Pump #1', type: 'Equipment', criticality: 'critical', children: [] },
            { id: 'conv-1', name: 'Conveyor Belt #1', type: 'Equipment', criticality: 'high', children: [] },
          ],
        },
        {
          id: 'line-2',
          name: 'Production Line B',
          type: 'System',
          criticality: 'medium',
          children: [
            { id: 'pump-2', name: 'Hydraulic Pump #2', type: 'Equipment', criticality: 'high', children: [] },
          ],
        },
      ],
    },
    {
      id: 'plant-2',
      name: 'Warehouse Facility',
      type: 'Facility',
      criticality: 'medium',
      children: [
        {
          id: 'hvac-1',
          name: 'HVAC System',
          type: 'System',
          criticality: 'medium',
          children: [
            { id: 'ahu-1', name: 'Air Handler Unit #1', type: 'Equipment', criticality: 'medium', children: [] },
          ],
        },
      ],
    },
  ];

  // Mock criticality data
  const criticalityAssets = [
    { id: 'asset-1', name: 'Hydraulic Pump #1', category: 'Pumps', criticality: 'critical', score: 95, consequence: 'Severe', probability: 'High', mtbf: '180 days', replacement_cost: '₱850,000' },
    { id: 'asset-2', name: 'Main Compressor', category: 'Compressors', criticality: 'critical', score: 92, consequence: 'Severe', probability: 'High', mtbf: '210 days', replacement_cost: '₱1,200,000' },
    { id: 'asset-3', name: 'Conveyor Belt #1', category: 'Conveyors', criticality: 'high', score: 78, consequence: 'Major', probability: 'Medium', mtbf: '300 days', replacement_cost: '₱450,000' },
    { id: 'asset-4', name: 'Backup Generator', category: 'Generators', criticality: 'high', score: 72, consequence: 'Major', probability: 'Low', mtbf: '450 days', replacement_cost: '₱2,100,000' },
    { id: 'asset-5', name: 'Cooling Tower #2', category: 'HVAC', criticality: 'medium', score: 58, consequence: 'Moderate', probability: 'Medium', mtbf: '360 days', replacement_cost: '₱680,000' },
  ];

  // Mock genealogy data
  const genealogyData = {
    current: { id: 'pump-1', name: 'Hydraulic Pump #1', install_date: '2023-03-15', status: 'operational', runtime: '12,450 hrs' },
    parent: { id: 'line-1', name: 'Production Line A', type: 'System' },
    children: [
      { id: 'motor-1', name: 'Electric Motor 5HP', type: 'Component', install_date: '2023-03-15' },
      { id: 'seal-1', name: 'Mechanical Seal', type: 'Component', install_date: '2024-02-10', replaced: true },
    ],
    siblings: [
      { id: 'conv-1', name: 'Conveyor Belt #1', type: 'Equipment' },
      { id: 'valve-1', name: 'Control Valve #1', type: 'Equipment' },
    ],
    history: [
      { date: '2024-09-15', event: 'Seal Replacement', technician: 'Juan Dela Cruz', cost: '₱45,000' },
      { date: '2024-06-20', event: 'Preventive Maintenance', technician: 'Maria Santos', cost: '₱12,500' },
      { date: '2024-03-10', event: 'Bearing Replacement', technician: 'Pedro Reyes', cost: '₱68,000' },
      { date: '2023-12-05', event: 'Oil Change', technician: 'Juan Dela Cruz', cost: '₱8,500' },
    ],
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const renderAssetTree = (assets: any[], level = 0) => {
    return assets.map((asset) => (
      <div key={asset.id} style={{ marginLeft: `${level * 24}px` }} className="my-1">
        <div className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => setSelectedAsset(asset.id)}>
          <span className="mr-2">
            {asset.type === 'Facility' ? '🏭' : asset.type === 'System' ? '⚙️' : '🔧'}
          </span>
          <span className="flex-1 font-medium">{asset.name}</span>
          <span className="text-xs text-gray-500 mr-2">{asset.type}</span>
          <span className={`px-2 py-1 text-xs rounded ${getCriticalityColor(asset.criticality)}`}>
            {asset.criticality}
          </span>
        </div>
        {asset.children && asset.children.length > 0 && renderAssetTree(asset.children, level + 1)}
      </div>
    ));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Asset Management (Advanced)</h1>
        <p className="text-gray-600">Manage asset hierarchy, criticality analysis, and genealogy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Assets</div>
          <div className="text-2xl font-bold text-gray-900">347</div>
          <div className="text-xs text-gray-500">Across all levels</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Critical Assets</div>
          <div className="text-2xl font-bold text-red-600">23</div>
          <div className="text-xs text-gray-500">Score ≥ 90</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">High Criticality</div>
          <div className="text-2xl font-bold text-orange-600">45</div>
          <div className="text-xs text-gray-500">Score 70-89</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Asset Levels</div>
          <div className="text-2xl font-bold text-blue-600">5</div>
          <div className="text-xs text-gray-500">Facility to Component</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`px-6 py-3 font-medium ${activeTab === 'hierarchy' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Asset Hierarchy
            </button>
            <button
              onClick={() => setActiveTab('criticality')}
              className={`px-6 py-3 font-medium ${activeTab === 'criticality' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Criticality Analysis
            </button>
            <button
              onClick={() => setActiveTab('genealogy')}
              className={`px-6 py-3 font-medium ${activeTab === 'genealogy' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Asset Genealogy
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Asset Hierarchy Tab */}
          {activeTab === 'hierarchy' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Asset Hierarchy Tree</h3>
                  <p className="text-sm text-gray-600">View parent-child relationships and organizational structure</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Asset Level
                </button>
              </div>

              <div className="bg-gray-50 rounded p-4">
                {renderAssetTree(assetHierarchy)}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-900 mb-2">Hierarchy Levels</h4>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">🏭 <span>Facility</span></span>
                  <span className="flex items-center gap-1">⚙️ <span>System</span></span>
                  <span className="flex items-center gap-1">🔧 <span>Equipment</span></span>
                  <span className="flex items-center gap-1">🔩 <span>Component</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Criticality Analysis Tab */}
          {activeTab === 'criticality' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Criticality Ranking</h3>
                  <p className="text-sm text-gray-600">Risk-based asset prioritization using consequence and probability</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Run Analysis
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Criticality</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Consequence</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Probability</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">MTBF</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {criticalityAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{asset.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{asset.category}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className={`h-2 rounded-full ${asset.score >= 90 ? 'bg-red-600' : asset.score >= 70 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                                style={{ width: `${asset.score}%` }}
                              />
                            </div>
                            <span className="font-semibold">{asset.score}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded ${getCriticalityColor(asset.criticality)}`}>
                            {asset.criticality}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{asset.consequence}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{asset.probability}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{asset.mtbf}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{asset.replacement_cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-red-50 rounded">
                  <div className="text-sm text-red-700 font-semibold">Critical (≥90)</div>
                  <div className="text-xs text-red-600">Immediate attention required</div>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-sm text-orange-700 font-semibold">High (70-89)</div>
                  <div className="text-xs text-orange-600">Regular monitoring needed</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded">
                  <div className="text-sm text-yellow-700 font-semibold">Medium (&lt;70)</div>
                  <div className="text-xs text-yellow-600">Standard maintenance schedule</div>
                </div>
              </div>
            </div>
          )}

          {/* Asset Genealogy Tab */}
          {activeTab === 'genealogy' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Asset Genealogy</h3>
                  <p className="text-sm text-gray-600">Track relationships, components, and maintenance history</p>
                </div>
                <select className="border rounded px-3 py-2">
                  <option>Hydraulic Pump #1</option>
                  <option>Main Compressor</option>
                  <option>Conveyor Belt #1</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Asset Info */}
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-semibold text-blue-900 mb-3">Current Asset</h4>
                  <div className="space-y-2">
                    <div><span className="text-sm text-gray-600">Name:</span> <span className="font-medium">{genealogyData.current.name}</span></div>
                    <div><span className="text-sm text-gray-600">Install Date:</span> <span className="font-medium">{genealogyData.current.install_date}</span></div>
                    <div><span className="text-sm text-gray-600">Status:</span> <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{genealogyData.current.status}</span></div>
                    <div><span className="text-sm text-gray-600">Runtime:</span> <span className="font-medium">{genealogyData.current.runtime}</span></div>
                  </div>
                </div>

                {/* Parent Asset */}
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold text-gray-900 mb-3">Parent Asset</h4>
                  <div className="space-y-2">
                    <div><span className="text-sm text-gray-600">Name:</span> <span className="font-medium">{genealogyData.parent.name}</span></div>
                    <div><span className="text-sm text-gray-600">Type:</span> <span className="font-medium">{genealogyData.parent.type}</span></div>
                  </div>
                </div>

                {/* Children Components */}
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold text-gray-900 mb-3">Components ({genealogyData.children.length})</h4>
                  <div className="space-y-2">
                    {genealogyData.children.map((child, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <div className="font-medium text-sm">{child.name}</div>
                          <div className="text-xs text-gray-500">{child.type} • Installed {child.install_date}</div>
                        </div>
                        {child.replaced && <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Replaced</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sibling Assets */}
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold text-gray-900 mb-3">Sibling Assets ({genealogyData.siblings.length})</h4>
                  <div className="space-y-2">
                    {genealogyData.siblings.map((sibling, idx) => (
                      <div key={idx} className="p-2 bg-white rounded">
                        <div className="font-medium text-sm">{sibling.name}</div>
                        <div className="text-xs text-gray-500">{sibling.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Maintenance History */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Maintenance History</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {genealogyData.history.map((event, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{event.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{event.event}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{event.technician}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{event.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
            <h3 className="text-lg font-semibold mb-4">Add Asset Level</h3>
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
