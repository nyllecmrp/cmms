'use client';

import { useState } from 'react';

interface Sensor {
  id: string;
  name: string;
  assetName: string;
  type: string;
  currentValue: number;
  unit: string;
  status: 'Normal' | 'Warning' | 'Critical';
  lastReading: string;
  trend: 'up' | 'down' | 'stable';
}

export default function PredictiveMaintenancePage() {
  const [activeTab, setActiveTab] = useState<'sensors' | 'predictions' | 'analytics'>('sensors');

  const [sensors] = useState<Sensor[]>([
    {
      id: '1',
      name: 'Vibration Sensor A1',
      assetName: 'Motor Pump #5',
      type: 'Vibration',
      currentValue: 4.2,
      unit: 'mm/s',
      status: 'Normal',
      lastReading: '2 minutes ago',
      trend: 'stable',
    },
    {
      id: '2',
      name: 'Temperature Probe T3',
      assetName: 'Bearing Assembly B2',
      type: 'Temperature',
      currentValue: 78,
      unit: '°C',
      status: 'Warning',
      lastReading: '5 minutes ago',
      trend: 'up',
    },
    {
      id: '3',
      name: 'Pressure Sensor P1',
      assetName: 'Hydraulic System',
      type: 'Pressure',
      currentValue: 145,
      unit: 'PSI',
      status: 'Critical',
      lastReading: '1 minute ago',
      trend: 'up',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return 'bg-green-100 text-green-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'stable': return '→';
      default: return '→';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Predictive Maintenance</h1>
        <p className="text-gray-600 mt-1">IoT sensors & condition monitoring</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Sensors</div>
          <div className="text-2xl font-bold text-gray-900">42</div>
          <div className="text-xs text-green-600 mt-1">↑ 6 added this month</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Anomalies Detected</div>
          <div className="text-2xl font-bold text-yellow-600">5</div>
          <div className="text-xs text-gray-500 mt-1">Requires attention</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Predicted Failures</div>
          <div className="text-2xl font-bold text-red-600">2</div>
          <div className="text-xs text-red-600 mt-1">Next 30 days</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Prevented Downtime</div>
          <div className="text-2xl font-bold text-green-600">48h</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'sensors', name: 'Sensor Dashboard', icon: '📡' },
              { id: 'predictions', name: 'Predictions', icon: '🔮' },
              { id: 'analytics', name: 'Analytics', icon: '📊' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Sensor Dashboard Tab */}
        {activeTab === 'sensors' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {sensors.map((sensor) => (
                <div key={sensor.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{sensor.name}</div>
                      <div className="text-xs text-gray-500">{sensor.assetName}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sensor.status)}`}>
                      {sensor.status}
                    </span>
                  </div>

                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-bold text-gray-900">{sensor.currentValue}</span>
                    <span className="text-sm text-gray-500 ml-2">{sensor.unit}</span>
                    <span className="text-lg ml-2">{getTrendIcon(sensor.trend)}</span>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">{sensor.lastReading}</div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        sensor.status === 'Critical' ? 'bg-red-600' :
                        sensor.status === 'Warning' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${(sensor.currentValue / 200) * 100}%` }}
                    ></div>
                  </div>

                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    View Details →
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Real-Time Monitoring</h3>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-center text-gray-500 py-8">
                  📈 Live sensor data visualization chart would appear here
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="p-6">
            <div className="space-y-4">
              {[
                {
                  asset: 'Motor Pump #5',
                  prediction: 'Bearing failure predicted',
                  confidence: 87,
                  timeframe: '15-20 days',
                  severity: 'High',
                  recommendation: 'Schedule bearing replacement within 2 weeks',
                },
                {
                  asset: 'Compressor Unit A3',
                  prediction: 'Performance degradation detected',
                  confidence: 72,
                  timeframe: '30-45 days',
                  severity: 'Medium',
                  recommendation: 'Plan preventive maintenance and inspection',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.asset}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.severity === 'High' ? 'bg-red-100 text-red-800' :
                          item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.severity} Risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.prediction}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>⏱️ {item.timeframe}</span>
                        <span>🎯 {item.confidence}% confidence</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Create WO
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-700 mb-1">Recommendation:</div>
                    <div className="text-sm text-gray-600">{item.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <div className="text-sm font-semibold text-blue-900 mb-1">ML Model Accuracy</div>
                  <div className="text-sm text-blue-800">
                    Current prediction model has 89% accuracy based on historical data from 500+ failures
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Failure Prevention Impact</h3>
                <div className="space-y-4">
                  {[
                    { metric: 'Downtime Prevented', value: '156 hours', trend: '+23%' },
                    { metric: 'Cost Savings', value: '$48,500', trend: '+18%' },
                    { metric: 'Emergency Repairs Avoided', value: '12 incidents', trend: '+35%' },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">{item.metric}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                      </div>
                      <div className="text-xs text-green-600">{item.trend} vs last quarter</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Performance</h3>
                <div className="space-y-4">
                  {[
                    { type: 'Vibration Sensors', active: 18, total: 20, uptime: 99.8 },
                    { type: 'Temperature Sensors', active: 15, total: 15, uptime: 100 },
                    { type: 'Pressure Sensors', active: 8, total: 10, uptime: 98.5 },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{item.type}</span>
                        <span className="text-sm text-gray-600">{item.active}/{item.total} active</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${item.uptime}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">{item.uptime}% uptime</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Condition Trends</h3>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600">Historical trend analysis and predictive charts</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
