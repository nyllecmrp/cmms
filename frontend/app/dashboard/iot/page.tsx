'use client';

export default function IoTPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">IoT Sensors & Monitoring</h1>
        <p className="text-gray-600 mt-1">Real-time equipment monitoring & alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Connected Sensors</div>
          <div className="text-2xl font-bold text-blue-600">124</div>
          <div className="text-xs text-green-600 mt-1">98% uptime</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Alerts</div>
          <div className="text-2xl font-bold text-red-600">7</div>
          <div className="text-xs text-gray-500 mt-1">Require attention</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Data Points Today</div>
          <div className="text-2xl font-bold text-purple-600">45.2K</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">System Health</div>
          <div className="text-2xl font-bold text-green-600">97%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Sensors</h2>
          <div className="space-y-3">
            {[
              { name: 'Temperature Sensor #A1', location: 'Building A', value: '72°F', status: 'Normal' },
              { name: 'Vibration Monitor #B2', location: 'Equipment Room', value: '2.1 Hz', status: 'Normal' },
              { name: 'Pressure Gauge #C3', location: 'Boiler Room', value: '85 PSI', status: 'Warning' },
              { name: 'Flow Meter #D4', location: 'Cooling System', value: '42 GPM', status: 'Normal' },
            ].map((sensor, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{sensor.name}</div>
                  <div className="text-sm text-gray-600">{sensor.location}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{sensor.value}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    sensor.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sensor.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {[
              { title: 'High Temperature Alert', sensor: 'Temp Sensor #A1', time: '5 minutes ago', level: 'Critical' },
              { title: 'Pressure Drop Detected', sensor: 'Pressure #C3', time: '12 minutes ago', level: 'Warning' },
              { title: 'Abnormal Vibration', sensor: 'Vibration #B2', time: '1 hour ago', level: 'Warning' },
            ].map((alert, idx) => (
              <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.level === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {alert.level}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{alert.sensor}</div>
                <div className="text-xs text-gray-500 mt-1">{alert.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

