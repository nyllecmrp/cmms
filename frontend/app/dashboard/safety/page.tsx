'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SafetyIncident {
  id: string;
  title: string;
  type: 'injury' | 'near_miss' | 'equipment_failure' | 'spill' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  location: string;
  reportedBy: string;
  assetId?: string;
  description: string;
  rootCause?: string;
  correctiveActions?: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  witnessCount: number;
}

interface ComplianceItem {
  id: string;
  regulation: string;
  category: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  lastAudit: string;
  nextAudit: string;
  responsible: string;
  evidence?: string;
}

export default function SafetyPage() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'incidents' | 'compliance' | 'audits'>('incidents');

  const [incidents, setIncidents] = useState<SafetyIncident[]>([
    {
      id: '1',
      title: 'Slip and Fall in Warehouse',
      type: 'injury',
      severity: 'medium',
      date: '2025-09-28',
      location: 'Warehouse A - Loading Dock',
      reportedBy: 'John Smith',
      description: 'Employee slipped on wet floor near loading dock',
      rootCause: 'Inadequate signage for wet floor',
      correctiveActions: 'Install additional warning signs, improve drainage',
      status: 'resolved',
      witnessCount: 2,
    },
    {
      id: '2',
      title: 'Near Miss - Falling Object',
      type: 'near_miss',
      severity: 'high',
      date: '2025-10-01',
      location: 'Production Line 2',
      reportedBy: 'Jane Doe',
      assetId: 'CRANE-01',
      description: 'Unsecured tool nearly fell from overhead crane',
      rootCause: 'Improper securing of tools',
      correctiveActions: 'Implement tool securing checklist, additional training',
      status: 'investigating',
      witnessCount: 1,
    },
    {
      id: '3',
      title: 'Chemical Spill - Minor',
      type: 'spill',
      severity: 'low',
      date: '2025-09-25',
      location: 'Quality Lab',
      reportedBy: 'Mike Johnson',
      description: 'Small chemical spill during testing',
      rootCause: 'Container defect',
      correctiveActions: 'Replace containers, update handling procedures',
      status: 'closed',
      witnessCount: 0,
    },
  ]);

  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([
    {
      id: '1',
      regulation: 'OSHA 29 CFR 1910.147',
      category: 'Lockout/Tagout',
      requirement: 'Energy control procedures for equipment maintenance',
      status: 'compliant',
      lastAudit: '2025-08-15',
      nextAudit: '2025-11-15',
      responsible: 'Safety Manager',
      evidence: 'Documented procedures, training records',
    },
    {
      id: '2',
      regulation: 'ISO 45001',
      category: 'Occupational Health & Safety',
      requirement: 'OH&S management system implementation',
      status: 'compliant',
      lastAudit: '2025-07-01',
      nextAudit: '2026-01-01',
      responsible: 'HSE Director',
      evidence: 'System documentation, audit reports',
    },
    {
      id: '3',
      regulation: 'OSHA 29 CFR 1910.134',
      category: 'Respiratory Protection',
      requirement: 'Respiratory protection program',
      status: 'pending',
      lastAudit: '2025-06-01',
      nextAudit: '2025-10-15',
      responsible: 'Safety Officer',
    },
    {
      id: '4',
      regulation: 'EPA 40 CFR 112',
      category: 'Spill Prevention',
      requirement: 'Spill Prevention Control and Countermeasure Plan',
      status: 'non_compliant',
      lastAudit: '2025-05-10',
      nextAudit: '2025-10-10',
      responsible: 'Environmental Manager',
      evidence: 'Plan requires update',
    },
  ]);

  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentFormData, setIncidentFormData] = useState({
    title: '',
    type: 'near_miss' as const,
    severity: 'medium' as const,
    date: '',
    location: '',
    reportedBy: user ? `${user.firstName} ${user.lastName}` : '',
    assetId: '',
    description: '',
    witnessCount: 0,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'reported': return 'bg-blue-100 text-blue-800';
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'injury': return '🚑';
      case 'near_miss': return '⚠️';
      case 'equipment_failure': return '⚙️';
      case 'spill': return '💧';
      case 'other': return '📋';
      default: return '📋';
    }
  };

  const handleCreateIncident = () => {
    if (!incidentFormData.title || !incidentFormData.date || !incidentFormData.location) {
      alert('Please fill in all required fields');
      return;
    }

    const newIncident: SafetyIncident = {
      id: String(incidents.length + 1),
      ...incidentFormData,
      status: 'reported',
    };

    setIncidents([newIncident, ...incidents]);
    setIsIncidentModalOpen(false);
    setIncidentFormData({
      title: '',
      type: 'near_miss',
      severity: 'medium',
      date: '',
      location: '',
      reportedBy: user ? `${user.firstName} ${user.lastName}` : '',
      assetId: '',
      description: '',
      witnessCount: 0,
    });
  };

  const incidentStats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    mtirRate: '2.4', // Mock MTIR (Medical Treatment Injury Rate)
  };

  const complianceStats = {
    total: complianceItems.length,
    compliant: complianceItems.filter(c => c.status === 'compliant').length,
    nonCompliant: complianceItems.filter(c => c.status === 'non_compliant').length,
    complianceRate: Math.round((complianceItems.filter(c => c.status === 'compliant').length / complianceItems.length) * 100),
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Safety & Compliance</h1>
        <p className="text-gray-600 mt-1">Incident tracking and regulatory compliance management</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setCurrentTab('incidents')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentTab === 'incidents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚨 Safety Incidents
            </button>
            <button
              onClick={() => setCurrentTab('compliance')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentTab === 'compliance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ✅ Compliance Tracking
            </button>
            <button
              onClick={() => setCurrentTab('audits')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentTab === 'audits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Audit Schedule
            </button>
          </nav>
        </div>
      </div>

      {/* Incidents Tab */}
      {currentTab === 'incidents' && (
        <>
          {/* Incident Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Incidents</p>
                  <p className="text-3xl font-bold text-gray-900">{incidentStats.total}</p>
                </div>
                <div className="text-4xl">🚨</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Incidents</p>
                  <p className="text-3xl font-bold text-gray-900">{incidentStats.critical}</p>
                </div>
                <div className="text-4xl">🔴</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Under Investigation</p>
                  <p className="text-3xl font-bold text-gray-900">{incidentStats.investigating}</p>
                </div>
                <div className="text-4xl">🔍</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">MTIR Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{incidentStats.mtirRate}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>
          </div>

          {/* Create Incident Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setIsIncidentModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              ➕ Report Incident
            </button>
          </div>

          {/* Incidents Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incident</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {incidents.map(incident => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getTypeIcon(incident.type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                          <div className="text-xs text-gray-500">Reported by {incident.reportedBy}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 capitalize">{incident.type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{incident.location}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{incident.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Compliance Tab */}
      {currentTab === 'compliance' && (
        <>
          {/* Compliance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requirements</p>
                  <p className="text-3xl font-bold text-gray-900">{complianceStats.total}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compliant</p>
                  <p className="text-3xl font-bold text-gray-900">{complianceStats.compliant}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Non-Compliant</p>
                  <p className="text-3xl font-bold text-gray-900">{complianceStats.nonCompliant}</p>
                </div>
                <div className="text-4xl">❌</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compliance Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{complianceStats.complianceRate}%</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>
          </div>

          {/* Compliance Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regulation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Audit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {complianceItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.regulation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{item.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{item.requirement}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{item.nextAudit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{item.responsible}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">Update</button>
                      <button className="text-gray-600 hover:text-gray-800">Evidence</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Audits Tab */}
      {currentTab === 'audits' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Audit Schedule</h3>
          <p className="text-gray-600 mb-6">
            Audit scheduling and tracking feature coming soon
          </p>
          <button 
            onClick={() => alert('Audit scheduling feature coming soon!')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Schedule New Audit
          </button>
        </div>
      )}

      {/* Report Incident Modal */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Safety Incident</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incident Title *</label>
                <input
                  type="text"
                  value={incidentFormData.title}
                  onChange={(e) => setIncidentFormData({ ...incidentFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={incidentFormData.type}
                    onChange={(e) => setIncidentFormData({ ...incidentFormData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="injury">Injury</option>
                    <option value="near_miss">Near Miss</option>
                    <option value="equipment_failure">Equipment Failure</option>
                    <option value="spill">Spill</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
                  <select
                    value={incidentFormData.severity}
                    onChange={(e) => setIncidentFormData({ ...incidentFormData, severity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={incidentFormData.date}
                    onChange={(e) => setIncidentFormData({ ...incidentFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Witness Count</label>
                  <input
                    type="number"
                    value={incidentFormData.witnessCount}
                    onChange={(e) => setIncidentFormData({ ...incidentFormData, witnessCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={incidentFormData.location}
                  onChange={(e) => setIncidentFormData({ ...incidentFormData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset ID (if applicable)</label>
                <input
                  type="text"
                  value={incidentFormData.assetId}
                  onChange={(e) => setIncidentFormData({ ...incidentFormData, assetId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., PUMP-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={incidentFormData.description}
                  onChange={(e) => setIncidentFormData({ ...incidentFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  rows={4}
                  placeholder="Describe what happened..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateIncident}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Report Incident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
