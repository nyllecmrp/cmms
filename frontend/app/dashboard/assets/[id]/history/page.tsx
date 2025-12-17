'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function AssetHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;

  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'workorders' | 'pmschedules'>('timeline');
  const [expandedTimelineItems, setExpandedTimelineItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getAssetMaintenanceHistory(assetId);
        setHistory(data);
      } catch (error: any) {
        alert(`Failed to load maintenance history: ${error.message}`);
        router.push('/dashboard/assets');
      } finally {
        setLoading(false);
      }
    };

    if (assetId) {
      fetchHistory();
    }
  }, [assetId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading maintenance history...</p>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No maintenance history found</p>
          <Link href="/dashboard/assets" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            ← Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWOStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/assets"
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
          >
            ← Back to Assets
          </Link>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asset Maintenance History</h1>
              <p className="text-gray-600 mt-1">
                {history.asset.name} ({history.asset.assetNumber})
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              🖨️ Print Report
            </button>
          </div>
        </div>

        {/* Asset Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Asset Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Manufacturer</p>
              <p className="text-base font-medium text-gray-900">{history.asset.manufacturer || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="text-base font-medium text-gray-900">{history.asset.model || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Serial Number</p>
              <p className="text-base font-medium text-gray-900">{history.asset.serialNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="text-base font-medium text-gray-900">{history.asset.category || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(history.asset.status)}`}>
                {history.asset.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Criticality</p>
              <p className="text-base font-medium text-gray-900">{history.asset.criticality || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-base font-medium text-gray-900">{history.asset.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Purchase Date</p>
              <p className="text-base font-medium text-gray-900">
                {history.asset.purchaseDate ? new Date(history.asset.purchaseDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Total Work Orders</p>
            <p className="text-2xl font-bold text-gray-900">{history.statistics.totalWorkOrders}</p>
            <p className="text-xs text-green-600 mt-1">{history.statistics.completedWorkOrders} completed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Preventive WOs</p>
            <p className="text-2xl font-bold text-green-600">{history.statistics.preventiveWorkOrders}</p>
            <p className="text-xs text-gray-500 mt-1">Planned</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Corrective WOs</p>
            <p className="text-2xl font-bold text-red-600">{history.statistics.correctiveWorkOrders}</p>
            <p className="text-xs text-gray-500 mt-1">Breakdowns</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-gray-900">₱{history.statistics.totalMaintenanceCost.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">MTBF (Days)</p>
            <p className="text-2xl font-bold text-blue-600">{history.statistics.mtbf || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-1">Between failures</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">MTTR (Hours)</p>
            <p className="text-2xl font-bold text-orange-600">{history.statistics.mttr || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-1">Avg repair time</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Total Hours</p>
            <p className="text-2xl font-bold text-gray-900">{history.statistics.totalMaintenanceHours}h</p>
            <p className="text-xs text-gray-500 mt-1">Maintenance time</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Downtime</p>
            <p className="text-2xl font-bold text-red-600">{history.statistics.totalDowntimeHours}h</p>
            <p className="text-xs text-gray-500 mt-1">Corrective only</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">PM Schedules</p>
            <p className="text-2xl font-bold text-gray-900">{history.statistics.totalPMSchedules}</p>
            <p className="text-xs text-green-600 mt-1">{history.statistics.activePMSchedules} active</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Open WOs</p>
            <p className="text-2xl font-bold text-yellow-600">{history.statistics.openWorkOrders}</p>
            <p className="text-xs text-gray-500 mt-1">Pending</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'timeline', name: 'Timeline', icon: '📅' },
                { id: 'workorders', name: 'Work Orders', icon: '🔧' },
                { id: 'pmschedules', name: 'PM Schedules', icon: '✓' },
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
            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Maintenance Timeline ({history.timeline.length} events)
                </h3>
                {history.timeline.map((event: any, index: number) => (
                  <div key={`${event.type}-${event.id}-${index}`} className="flex items-start gap-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${
                      event.type === 'work_order' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {event.type === 'work_order' ? '🔧' : '✓'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold text-gray-900">{event.title}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 flex-wrap">
                        {event.workOrderNumber && (
                          <span className="text-sm text-blue-600 font-medium">{event.workOrderNumber}</span>
                        )}
                        {event.workOrderType && (
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            event.workOrderType === 'preventive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {event.workOrderType}
                          </span>
                        )}
                        {event.frequency && (
                          <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium">
                            {event.frequency}
                          </span>
                        )}
                        {event.status && (
                          <span className={`text-xs px-2 py-1 rounded font-medium ${getWOStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        )}
                        {event.priority && (
                          <span className="text-xs text-gray-500">Priority: {event.priority}</span>
                        )}
                        <span className="text-sm text-gray-600">
                          👤 {event.assignedTo}
                        </span>
                        {event.hours > 0 && (
                          <span className="text-sm text-gray-700">⏱️ {event.hours}h</span>
                        )}
                        {event.estimatedHours > 0 && !event.hours && (
                          <span className="text-sm text-gray-500">⏱️ ~{event.estimatedHours}h</span>
                        )}
                        {event.cost > 0 && (
                          <span className="text-sm font-semibold text-gray-900">💰 ₱{event.cost.toLocaleString()}</span>
                        )}
                      </div>
                      {event.notes && (
                        <div className="mt-2 text-sm text-gray-600 italic">
                          Note: {event.notes}
                        </div>
                      )}
                      {event.parts && event.parts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">🔧 Parts Required/Used:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {event.parts.map((part: any, partIdx: number) => (
                              <div key={partIdx} className="bg-blue-50 text-blue-900 px-3 py-2 rounded text-sm">
                                <span className="font-medium">{part.name}</span>
                                <span className="text-blue-700 ml-2">
                                  Qty: {part.quantity} × ₱{part.estimatedCost?.toLocaleString() || part.price?.toLocaleString()} =
                                  ₱{((part.estimatedCost || part.price) * part.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Work Orders Tab */}
            {activeTab === 'workorders' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Work Orders ({history.workOrders.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WO Number</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {history.workOrders.map((wo: any) => (
                        <tr key={wo.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-blue-600 font-medium">{wo.workOrderNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{wo.title}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded ${
                              wo.type === 'preventive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {wo.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded ${getWOStatusColor(wo.status)}`}>
                              {wo.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{wo.assignedTo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{wo.actualHours || 0}h</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₱{wo.actualCost.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {wo.completedAt ? new Date(wo.completedAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PM Schedules Tab */}
            {activeTab === 'pmschedules' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  PM Schedules ({history.pmSchedules.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.pmSchedules.map((pm: any) => (
                    <div key={pm.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-semibold text-gray-900">{pm.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          pm.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {pm.status}
                        </span>
                      </div>
                      {pm.description && (
                        <p className="text-sm text-gray-600 mb-3">{pm.description}</p>
                      )}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Frequency:</span>
                          <span className="text-gray-900 font-medium">{pm.frequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Assigned To:</span>
                          <span className="text-gray-900">{pm.assignedTo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Completed:</span>
                          <span className="text-gray-900">
                            {pm.lastCompleted ? new Date(pm.lastCompleted).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Next Due:</span>
                          <span className="text-gray-900 font-medium">
                            {new Date(pm.nextDue).toLocaleDateString()}
                          </span>
                        </div>
                        {pm.estimatedHours > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Estimated Hours:</span>
                            <span className="text-gray-900">{pm.estimatedHours}h</span>
                          </div>
                        )}
                      </div>
                      {pm.parts && pm.parts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Parts Required:</p>
                          <div className="space-y-1">
                            {pm.parts.map((part: any, partIdx: number) => (
                              <div key={partIdx} className="bg-white px-2 py-1.5 rounded text-xs border border-blue-100">
                                <span className="font-medium text-gray-900">{part.name}</span>
                                <span className="text-gray-600 ml-2">
                                  x{part.quantity} @ ₱{part.estimatedCost?.toLocaleString() || part.price?.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
