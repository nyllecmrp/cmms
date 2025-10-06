'use client';

import { useState } from 'react';

export default function WorkOrdersAdvancedPage() {
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'sla'>('workflows');
  const [showModal, setShowModal] = useState(false);

  // Mock workflow data
  const workflows = [
    {
      id: 'wf-1',
      name: 'Standard Maintenance Approval',
      type: 'Sequential',
      steps: [
        { order: 1, role: 'Technician', action: 'Submit', status: 'active' },
        { order: 2, role: 'Supervisor', action: 'Review', status: 'active' },
        { order: 3, role: 'Manager', action: 'Approve', status: 'active' },
      ],
      usage_count: 245,
      avg_duration: '2.3 hrs',
    },
    {
      id: 'wf-2',
      name: 'Emergency Work Approval',
      type: 'Parallel',
      steps: [
        { order: 1, role: 'Technician', action: 'Submit', status: 'active' },
        { order: 2, role: 'Supervisor & Safety Officer', action: 'Review (Parallel)', status: 'active' },
        { order: 3, role: 'Manager', action: 'Final Approve', status: 'active' },
      ],
      usage_count: 89,
      avg_duration: '45 mins',
    },
    {
      id: 'wf-3',
      name: 'Capital Project Approval',
      type: 'Sequential',
      steps: [
        { order: 1, role: 'Project Lead', action: 'Submit', status: 'active' },
        { order: 2, role: 'Engineering Manager', action: 'Technical Review', status: 'active' },
        { order: 3, role: 'Finance Manager', action: 'Budget Review', status: 'active' },
        { order: 4, role: 'VP Operations', action: 'Final Approval', status: 'active' },
      ],
      usage_count: 34,
      avg_duration: '5.2 days',
    },
  ];

  // Mock template data
  const templates = [
    {
      id: 'tpl-1',
      name: 'Pump Preventive Maintenance',
      category: 'PM',
      tasks: ['Visual Inspection', 'Lubrication', 'Vibration Check', 'Seal Inspection', 'Performance Test'],
      duration: '2 hrs',
      parts: ['Oil Filter', 'Grease', 'Seal Kit'],
      usage_count: 156,
    },
    {
      id: 'tpl-2',
      name: 'HVAC Filter Replacement',
      category: 'PM',
      tasks: ['Remove Old Filter', 'Clean Housing', 'Install New Filter', 'Test Airflow'],
      duration: '30 mins',
      parts: ['HEPA Filter'],
      usage_count: 234,
    },
    {
      id: 'tpl-3',
      name: 'Emergency Shutdown Procedure',
      category: 'Emergency',
      tasks: ['Isolate Equipment', 'Lock Out Tag Out', 'Diagnose Issue', 'Safety Assessment', 'Repair Plan'],
      duration: '4 hrs',
      parts: ['Variable'],
      usage_count: 45,
    },
    {
      id: 'tpl-4',
      name: 'Conveyor Belt Inspection',
      category: 'Inspection',
      tasks: ['Visual Check', 'Tension Measurement', 'Alignment Check', 'Roller Inspection'],
      duration: '1.5 hrs',
      parts: ['None'],
      usage_count: 98,
    },
  ];

  // Mock SLA data
  const slaMetrics = [
    {
      id: 'sla-1',
      priority: 'Critical',
      response_time: '15 mins',
      resolution_time: '4 hrs',
      compliance: 94,
      met: 167,
      missed: 11,
      avg_response: '12 mins',
      avg_resolution: '3.2 hrs',
    },
    {
      id: 'sla-2',
      priority: 'High',
      response_time: '1 hr',
      resolution_time: '8 hrs',
      compliance: 89,
      met: 245,
      missed: 31,
      avg_response: '52 mins',
      avg_resolution: '6.8 hrs',
    },
    {
      id: 'sla-3',
      priority: 'Medium',
      response_time: '4 hrs',
      resolution_time: '24 hrs',
      compliance: 96,
      met: 412,
      missed: 18,
      avg_response: '3.1 hrs',
      avg_resolution: '18.5 hrs',
    },
    {
      id: 'sla-4',
      priority: 'Low',
      response_time: '8 hrs',
      resolution_time: '48 hrs',
      compliance: 98,
      met: 289,
      missed: 6,
      avg_response: '5.2 hrs',
      avg_resolution: '32.7 hrs',
    },
  ];

  const activeWorkOrders = [
    { id: 'wo-1', title: 'Pump Repair', priority: 'Critical', workflow: 'Emergency Work Approval', step: '2/3', sla_status: 'on_time', time_left: '2h 15m' },
    { id: 'wo-2', title: 'HVAC Maintenance', priority: 'High', workflow: 'Standard Maintenance Approval', step: '3/3', sla_status: 'at_risk', time_left: '45m' },
    { id: 'wo-3', title: 'Belt Inspection', priority: 'Medium', workflow: 'Standard Maintenance Approval', step: '1/3', sla_status: 'on_time', time_left: '18h 30m' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-700 bg-red-100';
      case 'High': return 'text-orange-700 bg-orange-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'Low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getSLAColor = (status: string) => {
    switch (status) {
      case 'on_time': return 'text-green-700 bg-green-100';
      case 'at_risk': return 'text-orange-700 bg-orange-100';
      case 'overdue': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Work Order Management (Advanced)</h1>
        <p className="text-gray-600">Approval workflows, templates, and SLA tracking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Active Workflows</div>
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-xs text-gray-500">245 total approvals</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Work Templates</div>
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-xs text-gray-500">533 times used</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">SLA Compliance</div>
          <div className="text-2xl font-bold text-green-600">94%</div>
          <div className="text-xs text-gray-500">1,113/1,179 met</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Avg Resolution</div>
          <div className="text-2xl font-bold text-orange-600">12.3h</div>
          <div className="text-xs text-gray-500">Across all priorities</div>
        </div>
      </div>

      {/* Active Work Orders with Workflow Status */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h3 className="text-lg font-semibold mb-4">Active Work Orders in Approval</h3>
        <div className="space-y-3">
          {activeWorkOrders.map((wo) => (
            <div key={wo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-4 flex-1">
                <div>
                  <div className="font-medium">{wo.title}</div>
                  <div className="text-sm text-gray-600">{wo.workflow} - Step {wo.step}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(wo.priority)}`}>
                  {wo.priority}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${getSLAColor(wo.sla_status)}`}>
                  {wo.time_left}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('workflows')}
              className={`px-6 py-3 font-medium ${activeTab === 'workflows' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Approval Workflows
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 font-medium ${activeTab === 'templates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Work Templates
            </button>
            <button
              onClick={() => setActiveTab('sla')}
              className={`px-6 py-3 font-medium ${activeTab === 'sla' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              SLA Tracking
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Approval Workflows Tab */}
          {activeTab === 'workflows' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Approval Workflows</h3>
                  <p className="text-sm text-gray-600">Configure multi-step approval processes</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Workflow
                </button>
              </div>

              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
                        <span className="text-xs text-gray-500">{workflow.type} Workflow</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{workflow.usage_count} uses</div>
                        <div className="text-xs text-gray-500">Avg: {workflow.avg_duration}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {workflow.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className="bg-blue-100 px-3 py-2 rounded text-sm">
                            <div className="font-medium text-blue-900">{step.order}. {step.role}</div>
                            <div className="text-xs text-blue-700">{step.action}</div>
                          </div>
                          {idx < workflow.steps.length - 1 && (
                            <div className="mx-2 text-gray-400">→</div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button className="text-sm text-blue-600 hover:underline">Edit</button>
                      <button className="text-sm text-gray-600 hover:underline">Duplicate</button>
                      <button className="text-sm text-red-600 hover:underline">Deactivate</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Templates Tab */}
          {activeTab === 'templates' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Work Order Templates</h3>
                  <p className="text-sm text-gray-600">Standardized task lists and procedures</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${template.category === 'PM' ? 'bg-blue-100 text-blue-700' : template.category === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {template.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{template.usage_count} uses</div>
                        <div className="text-xs text-gray-500">~{template.duration}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Tasks ({template.tasks.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {template.tasks.map((task, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Required Parts</div>
                      <div className="text-sm text-gray-600">{template.parts.join(', ')}</div>
                    </div>

                    <div className="flex gap-2">
                      <button className="text-sm text-blue-600 hover:underline">Use Template</button>
                      <button className="text-sm text-gray-600 hover:underline">Edit</button>
                      <button className="text-sm text-red-600 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLA Tracking Tab */}
          {activeTab === 'sla' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">SLA Performance</h3>
                  <p className="text-sm text-gray-600">Service level agreement metrics and compliance</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Configure SLA
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Response SLA</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolution SLA</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Met/Missed</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Response</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {slaMetrics.map((sla) => (
                      <tr key={sla.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(sla.priority)}`}>
                            {sla.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{sla.response_time}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{sla.resolution_time}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className={`h-2 rounded-full ${sla.compliance >= 95 ? 'bg-green-600' : sla.compliance >= 85 ? 'bg-yellow-500' : 'bg-red-600'}`}
                                style={{ width: `${sla.compliance}%` }}
                              />
                            </div>
                            <span className="font-semibold text-sm">{sla.compliance}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className="text-green-600">{sla.met}</span> / <span className="text-red-600">{sla.missed}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sla.avg_response}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sla.avg_resolution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-700">1,113</div>
                  <div className="text-sm text-green-600">SLAs Met</div>
                </div>
                <div className="p-4 bg-red-50 rounded">
                  <div className="text-2xl font-bold text-red-700">66</div>
                  <div className="text-sm text-red-600">SLAs Missed</div>
                </div>
                <div className="p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-700">94.4%</div>
                  <div className="text-sm text-blue-600">Overall Compliance</div>
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
            <h3 className="text-lg font-semibold mb-4">Create New {activeTab === 'workflows' ? 'Workflow' : activeTab === 'templates' ? 'Template' : 'SLA'}</h3>
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
