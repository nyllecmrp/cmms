'use client';

export default function MobileAdvancedPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mobile Advanced Features</h1>
        <p className="text-gray-600 mt-1">Enhanced mobile capabilities & offline mode</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Mobile Users</div>
          <div className="text-2xl font-bold text-blue-600">34</div>
          <div className="text-xs text-gray-500 mt-1">Active this month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Offline Actions</div>
          <div className="text-2xl font-bold text-green-600">247</div>
          <div className="text-xs text-gray-500 mt-1">Synced successfully</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Mobile Work Orders</div>
          <div className="text-2xl font-bold text-purple-600">156</div>
          <div className="text-xs text-gray-500 mt-1">Completed via mobile</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mobile Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { feature: 'Offline Mode', desc: 'Work without internet connection', status: 'Active' },
            { feature: 'Barcode Scanner', desc: 'Scan assets & parts', status: 'Active' },
            { feature: 'Voice Notes', desc: 'Record audio annotations', status: 'Active' },
            { feature: 'GPS Tracking', desc: 'Location-based check-ins', status: 'Active' },
            { feature: 'Photo Attachments', desc: 'Upload up to 10 photos per WO', status: 'Active' },
            { feature: 'Digital Signatures', desc: 'Sign off work orders on-site', status: 'Active' },
          ].map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.feature}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

