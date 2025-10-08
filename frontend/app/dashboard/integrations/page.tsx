'use client';

export default function IntegrationsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-1">Connect with third-party systems</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Integrations</div>
          <div className="text-2xl font-bold text-green-600">5</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Available</div>
          <div className="text-2xl font-bold text-blue-600">12</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Data Synced Today</div>
          <div className="text-2xl font-bold text-purple-600">1,247</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Microsoft Azure AD', type: 'Authentication', status: 'Active', lastSync: '2 minutes ago' },
            { name: 'SAP ERP', type: 'Business System', status: 'Active', lastSync: '15 minutes ago' },
            { name: 'Slack', type: 'Communications', status: 'Active', lastSync: '1 hour ago' },
            { name: 'Google Calendar', type: 'Scheduling', status: 'Active', lastSync: '5 minutes ago' },
            { name: 'QuickBooks', type: 'Accounting', status: 'Active', lastSync: '30 minutes ago' },
          ].map((integration, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-600">{integration.type}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {integration.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Last synced: {integration.lastSync}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                  Configure
                </button>
                <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Test Connection
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Salesforce', type: 'CRM' },
            { name: 'Zapier', type: 'Automation' },
            { name: 'Microsoft Teams', type: 'Communications' },
            { name: 'Jira', type: 'Project Management' },
            { name: 'Google Workspace', type: 'Productivity' },
            { name: 'Dropbox', type: 'File Storage' },
          ].map((integration, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-1">{integration.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{integration.type}</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

