'use client';

import { useState } from 'react';

interface Audit {
  id: string;
  auditNumber: string;
  title: string;
  type: 'internal' | 'external' | 'regulatory' | 'quality';
  standard: string;
  auditor: string;
  auditDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'follow_up';
  score: number;
  findings: number;
  criticalFindings: number;
  department: string;
}

interface Finding {
  id: string;
  auditId: string;
  category: string;
  severity: 'critical' | 'major' | 'minor' | 'observation';
  description: string;
  requirement: string;
  correctiveAction: string;
  responsible: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'closed' | 'verified';
}

export default function AuditPage() {
  const [currentTab, setCurrentTab] = useState<'audits' | 'findings' | 'schedule'>('audits');

  const [audits, setAudits] = useState<Audit[]>([
    {
      id: '1',
      auditNumber: 'AUD-2025-001',
      title: 'ISO 9001:2015 Surveillance Audit',
      type: 'external',
      standard: 'ISO 9001:2015',
      auditor: 'SGS Philippines',
      auditDate: '2025-09-15',
      status: 'completed',
      score: 92,
      findings: 3,
      criticalFindings: 0,
      department: 'Quality Assurance',
    },
    {
      id: '2',
      auditNumber: 'AUD-2025-002',
      title: 'Maintenance Process Audit',
      type: 'internal',
      standard: 'ISO 55001',
      auditor: 'Internal QA Team',
      auditDate: '2025-09-28',
      status: 'completed',
      score: 88,
      findings: 5,
      criticalFindings: 1,
      department: 'Maintenance',
    },
    {
      id: '3',
      auditNumber: 'AUD-2025-003',
      title: 'Safety Compliance Audit',
      type: 'regulatory',
      standard: 'OSHA Standards',
      auditor: 'DOLE Inspector',
      auditDate: '2025-10-05',
      status: 'scheduled',
      score: 0,
      findings: 0,
      criticalFindings: 0,
      department: 'Safety',
    },
    {
      id: '4',
      auditNumber: 'AUD-2025-004',
      title: 'Equipment Calibration Audit',
      type: 'quality',
      standard: 'ISO 17025',
      auditor: 'Quality Manager',
      auditDate: '2025-10-10',
      status: 'scheduled',
      score: 0,
      findings: 0,
      criticalFindings: 0,
      department: 'Quality Control',
    },
  ]);

  const [findings, setFindings] = useState<Finding[]>([
    {
      id: '1',
      auditId: '1',
      category: 'Documentation',
      severity: 'minor',
      description: 'Maintenance records not updated for asset PUMP-003',
      requirement: 'ISO 9001:2015 Clause 7.5.3',
      correctiveAction: 'Update all maintenance records and implement weekly review process',
      responsible: 'Maintenance Supervisor',
      dueDate: '2025-10-15',
      status: 'in_progress',
    },
    {
      id: '2',
      auditId: '2',
      category: 'Process Compliance',
      severity: 'critical',
      description: 'PM schedules not followed for critical equipment',
      requirement: 'ISO 55001 Maintenance Planning',
      correctiveAction: 'Revise PM scheduling system and add automated reminders',
      responsible: 'Maintenance Manager',
      dueDate: '2025-10-08',
      status: 'in_progress',
    },
    {
      id: '3',
      auditId: '1',
      category: 'Training',
      severity: 'major',
      description: 'Technician training records incomplete',
      requirement: 'ISO 9001:2015 Clause 7.2',
      correctiveAction: 'Complete training records and implement training tracking system',
      responsible: 'HR Manager',
      dueDate: '2025-10-20',
      status: 'open',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'verified': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'major': return 'bg-orange-100 text-orange-800';
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'observation': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalAudits: audits.length,
    completed: audits.filter(a => a.status === 'completed').length,
    avgScore: Math.round(audits.filter(a => a.score > 0).reduce((sum, a) => sum + a.score, 0) / audits.filter(a => a.score > 0).length),
    openFindings: findings.filter(f => f.status === 'open' || f.status === 'in_progress').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit & Quality Management</h1>
        <p className="text-gray-600 mt-1">Manage audits, compliance, and quality assurance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Audits</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAudits}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgScore}%</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Findings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.openFindings}</p>
            </div>
            <div className="text-4xl">🔍</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setCurrentTab('audits')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentTab === 'audits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Audits
            </button>
            <button
              onClick={() => setCurrentTab('findings')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentTab === 'findings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🔍 Findings & CAR
            </button>
            <button
              onClick={() => setCurrentTab('schedule')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                currentTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📅 Audit Schedule
            </button>
          </nav>
        </div>
      </div>

      {/* Audits Tab */}
      {currentTab === 'audits' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Audit Records</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              ➕ Schedule Audit
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auditor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Findings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {audits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{audit.title}</div>
                      <div className="text-xs text-gray-500">{audit.auditNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 capitalize">{audit.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{audit.standard}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{audit.auditor}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{audit.auditDate}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {audit.score > 0 ? (
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 w-16">
                          <div
                            className={`h-2 rounded-full ${
                              audit.score >= 90 ? 'bg-green-500' :
                              audit.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${audit.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{audit.score}%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {audit.findings}
                      {audit.criticalFindings > 0 && (
                        <span className="ml-1 text-red-600">({audit.criticalFindings} critical)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(audit.status)}`}>
                      {audit.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800">View Report</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Findings Tab */}
      {currentTab === 'findings' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Findings & Corrective Actions</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finding</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Corrective Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {findings.map((finding) => (
                <tr key={finding.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{finding.category}</div>
                      <div className="text-xs text-gray-500">{finding.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{finding.requirement}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{finding.correctiveAction}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{finding.responsible}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{finding.dueDate}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(finding.status)}`}>
                      {finding.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Tab */}
      {currentTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Audit Calendar</h3>
          <p className="text-gray-600 mb-6">
            Visual audit schedule and planning feature
          </p>
          <button 
            onClick={() => alert('Audit calendar feature coming soon!')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Calendar
          </button>
        </div>
      )}
    </div>
  );
}
