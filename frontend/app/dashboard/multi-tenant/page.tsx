'use client';

export default function MultiTenantPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Multi-Tenant Management</h1>
        <p className="text-gray-600 mt-1">Manage multiple organizations & departments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Organizations</div>
          <div className="text-2xl font-bold text-blue-600">12</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Departments</div>
          <div className="text-2xl font-bold text-green-600">48</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-purple-600">247</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Shared Resources</div>
          <div className="text-2xl font-bold text-orange-600">34</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Structure</h2>
        <div className="space-y-4">
          {[
            { name: 'Headquarters', departments: 8, users: 45, assets: 234 },
            { name: 'Manufacturing Plant A', departments: 12, users: 67, assets: 456 },
            { name: 'Distribution Center B', departments: 6, users: 34, assets: 123 },
          ].map((org, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{org.name}</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Departments</div>
                  <div className="text-lg font-semibold text-gray-900">{org.departments}</div>
                </div>
                <div>
                  <div className="text-gray-600">Users</div>
                  <div className="text-lg font-semibold text-gray-900">{org.users}</div>
                </div>
                <div>
                  <div className="text-gray-600">Assets</div>
                  <div className="text-lg font-semibold text-gray-900">{org.assets}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

