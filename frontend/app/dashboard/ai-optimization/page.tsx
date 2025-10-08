'use client';

export default function AIOptimizationPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Optimization</h1>
        <p className="text-gray-600 mt-1">AI-powered maintenance optimization & predictions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Optimization Score</div>
          <div className="text-2xl font-bold text-green-600">92%</div>
          <div className="text-xs text-gray-500 mt-1">↑ 5% this month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Cost Savings</div>
          <div className="text-2xl font-bold text-blue-600">$12,450</div>
          <div className="text-xs text-gray-500 mt-1">This quarter</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">AI Recommendations</div>
          <div className="text-2xl font-bold text-purple-600">18</div>
          <div className="text-xs text-gray-500 mt-1">Pending review</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Insights</h2>
        <div className="space-y-4">
          {[
            { title: 'Predictive Maintenance Opportunity', desc: 'Asset #A-1234 shows early wear patterns', priority: 'High', savings: '$2,400' },
            { title: 'Schedule Optimization', desc: 'Recommend consolidating 3 work orders', priority: 'Medium', savings: '$850' },
            { title: 'Inventory Optimization', desc: 'Reduce stock levels for Part #P-567', priority: 'Low', savings: '$450' },
          ].map((insight, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{insight.desc}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.priority === 'High' ? 'bg-red-100 text-red-800' :
                      insight.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.priority} Priority
                    </span>
                    <span className="text-green-600 font-semibold">💰 Save {insight.savings}</span>
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

