'use client';

export default function WorkflowsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-1">Automate processes & approvals</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
          + Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Workflows</div>
          <div className="text-2xl font-bold text-blue-600">12</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Automated Actions</div>
          <div className="text-2xl font-bold text-green-600">1,247</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Time Saved</div>
          <div className="text-2xl font-bold text-purple-600">124 hrs</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Workflows</h2>
        <div className="space-y-4">
          {[
            { name: 'Work Order Approval', trigger: 'New work order created', actions: 3, runs: 145 },
            { name: 'Asset Maintenance Alert', trigger: 'PM schedule due', actions: 2, runs: 89 },
            { name: 'Inventory Restock', trigger: 'Low stock threshold', actions: 4, runs: 67 },
          ].map((workflow, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{workflow.name}</h3>
                  <div className="text-sm text-gray-600">
                    <div>🎯 Trigger: {workflow.trigger}</div>
                    <div>⚡ {workflow.actions} actions • {workflow.runs} runs this month</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

