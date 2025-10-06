'use client';

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Prediction {
  id: string;
  assetId: string;
  assetName: string;
  prediction: string;
  probability: number;
  timeframe: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  dataPoints: number;
  lastUpdated: string;
  status: 'monitoring' | 'action_needed' | 'scheduled';
}

export default function PredictivePage() {
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: '1',
      assetId: 'PUMP-001',
      assetName: 'Hydraulic Pump Unit A',
      prediction: 'Bearing failure predicted',
      probability: 78,
      timeframe: '15-20 days',
      severity: 'high',
      recommendations: [
        'Schedule bearing replacement within 2 weeks',
        'Increase vibration monitoring frequency',
        'Order replacement bearings immediately'
      ],
      dataPoints: 1250,
      lastUpdated: '2025-10-03 14:30',
      status: 'action_needed',
    },
    {
      id: '2',
      assetId: 'CT-SCAN-01',
      assetName: 'CT Scanner - Radiology',
      prediction: 'X-ray tube degradation',
      probability: 65,
      timeframe: '30-45 days',
      severity: 'medium',
      recommendations: [
        'Plan tube replacement in next maintenance window',
        'Monitor image quality daily',
        'Budget approval for tube replacement'
      ],
      dataPoints: 850,
      lastUpdated: '2025-10-03 12:15',
      status: 'scheduled',
    },
    {
      id: '3',
      assetId: 'HVAC-05',
      assetName: 'HVAC Unit - Floor 3',
      prediction: 'Compressor efficiency decline',
      probability: 82,
      timeframe: '7-10 days',
      severity: 'critical',
      recommendations: [
        'Immediate inspection required',
        'Check refrigerant levels',
        'Prepare for emergency replacement'
      ],
      dataPoints: 2100,
      lastUpdated: '2025-10-03 15:00',
      status: 'action_needed',
    },
    {
      id: '4',
      assetId: 'GEN-001',
      assetName: 'Emergency Generator',
      prediction: 'Battery performance degradation',
      probability: 55,
      timeframe: '60-90 days',
      severity: 'low',
      recommendations: [
        'Monitor battery voltage trends',
        'Plan battery replacement in Q4',
        'Continue monthly testing'
      ],
      dataPoints: 680,
      lastUpdated: '2025-10-03 11:30',
      status: 'monitoring',
    },
  ]);

  const vibrationData = [
    { time: '00:00', value: 0.8, threshold: 2.0 },
    { time: '04:00', value: 0.9, threshold: 2.0 },
    { time: '08:00', value: 1.1, threshold: 2.0 },
    { time: '12:00', value: 1.3, threshold: 2.0 },
    { time: '16:00', value: 1.5, threshold: 2.0 },
    { time: '20:00', value: 1.7, threshold: 2.0 },
    { time: '24:00', value: 1.9, threshold: 2.0 },
  ];

  const temperatureData = [
    { time: 'Week 1', temp: 65, limit: 75 },
    { time: 'Week 2', temp: 68, limit: 75 },
    { time: 'Week 3', temp: 70, limit: 75 },
    { time: 'Week 4', temp: 73, limit: 75 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'monitoring': return 'bg-blue-100 text-blue-800';
      case 'action_needed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: predictions.length,
    critical: predictions.filter(p => p.severity === 'critical').length,
    actionNeeded: predictions.filter(p => p.status === 'action_needed').length,
    avgProbability: Math.round(predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length),
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Predictive Maintenance</h1>
        <p className="text-gray-600 mt-1">AI-powered failure prediction and prevention</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Predictions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-4xl">🔮</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Issues</p>
              <p className="text-3xl font-bold text-gray-900">{stats.critical}</p>
            </div>
            <div className="text-4xl">🚨</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Action Needed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.actionNeeded}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Probability</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgProbability}%</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vibration Trend Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={vibrationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Vibration (mm/s)" />
              <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Threshold" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature Monitoring</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="temp" fill="#8b5cf6" name="Temperature (°C)" />
              <Bar dataKey="limit" fill="#f59e0b" name="Limit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Failure Predictions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prediction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Probability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeframe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {predictions.map((pred) => (
                <tr key={pred.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pred.assetName}</div>
                      <div className="text-xs text-gray-500">{pred.assetId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{pred.prediction}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            pred.probability >= 75 ? 'bg-red-500' :
                            pred.probability >= 50 ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${pred.probability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{pred.probability}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{pred.timeframe}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(pred.severity)}`}>
                      {pred.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pred.status)}`}>
                      {pred.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow p-6 border border-purple-200">
        <div className="flex items-start">
          <div className="flex-shrink-0 text-4xl mr-4">🤖</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">⚡ High Priority Alert</p>
                <p className="text-sm text-gray-600 mt-1">
                  HVAC-05 compressor showing critical degradation patterns. Immediate action recommended to prevent system failure.
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">💡 Optimization Opportunity</p>
                <p className="text-sm text-gray-600 mt-1">
                  Adjusting PUMP-001 maintenance schedule by 2 weeks based on usage patterns could save ₱15,000 in unnecessary interventions.
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">📈 Trend Analysis</p>
                <p className="text-sm text-gray-600 mt-1">
                  Overall equipment reliability improved by 12% since implementing predictive maintenance recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
