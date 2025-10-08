'use client';

export default function FailureAnalysisPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Failure Analysis</h1>
        <p className="text-gray-600 mt-1">Root cause analysis & failure tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Failures (YTD)</div>
          <div className="text-2xl font-bold text-red-600">42</div>
          <div className="text-xs text-green-600 mt-1">↓ 15% vs last year</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Analyzed</div>
          <div className="text-2xl font-bold text-blue-600">38</div>
          <div className="text-xs text-gray-500 mt-1">90% completion rate</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Avg Resolution Time</div>
          <div className="text-2xl font-bold text-purple-600">4.2 days</div>
          <div className="text-xs text-green-600 mt-1">↓ 0.8 days</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Cost Impact</div>
          <div className="text-2xl font-bold text-orange-600">$34,500</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Failure Analyses</h2>
        <div className="space-y-4">
          {[
            { asset: 'Pump #A-1234', date: '2024-10-03', cause: 'Bearing Wear', severity: 'High', status: 'Resolved' },
            { asset: 'Motor #B-5678', date: '2024-09-28', cause: 'Overheating', severity: 'Medium', status: 'In Progress' },
            { asset: 'Compressor #C-9012', date: '2024-09-25', cause: 'Seal Failure', severity: 'High', status: 'Resolved' },
          ].map((failure, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{failure.asset}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                    <span>📅 {failure.date}</span>
                    <span>🔍 Root Cause: {failure.cause}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      failure.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {failure.severity} Severity
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    failure.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {failure.status}
                  </span>
                </div>
                <button className="ml-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                  View Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

