'use client';

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EnergyMeter {
  id: string;
  name: string;
  location: string;
  type: 'electricity' | 'water' | 'gas' | 'steam';
  currentReading: number;
  unit: string;
  cost: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export default function EnergyPage() {
  const [meters] = useState<EnergyMeter[]>([
    {
      id: '1',
      name: 'Main Electrical Meter',
      location: 'Main Building',
      type: 'electricity',
      currentReading: 12500,
      unit: 'kWh',
      cost: 137500,
      trend: 'down',
      lastUpdated: '2025-10-03 14:00',
    },
    {
      id: '2',
      name: 'Water Consumption',
      location: 'Facility Wide',
      type: 'water',
      currentReading: 8900,
      unit: 'm³',
      cost: 44500,
      trend: 'stable',
      lastUpdated: '2025-10-03 14:00',
    },
    {
      id: '3',
      name: 'Natural Gas',
      location: 'Production Area',
      type: 'gas',
      currentReading: 3200,
      unit: 'm³',
      cost: 64000,
      trend: 'up',
      lastUpdated: '2025-10-03 14:00',
    },
  ]);

  const consumptionData = [
    { month: 'Jan', electricity: 11200, water: 7800, gas: 2900 },
    { month: 'Feb', electricity: 11500, water: 8100, gas: 3000 },
    { month: 'Mar', electricity: 12000, water: 8400, gas: 3100 },
    { month: 'Apr', electricity: 12800, water: 8900, gas: 3300 },
    { month: 'May', electricity: 13200, water: 9200, gas: 3400 },
    { month: 'Jun', electricity: 12500, water: 8900, gas: 3200 },
  ];

  const costBreakdown = [
    { name: 'Electricity', value: 137500, color: '#3b82f6' },
    { name: 'Water', value: 44500, color: '#14b8a6' },
    { name: 'Gas', value: 64000, color: '#f59e0b' },
  ];

  const hourlyData = [
    { hour: '00:00', consumption: 85 },
    { hour: '04:00', consumption: 75 },
    { hour: '08:00', consumption: 120 },
    { hour: '12:00', consumption: 150 },
    { hour: '16:00', consumption: 140 },
    { hour: '20:00', consumption: 110 },
    { hour: '24:00', consumption: 90 },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'electricity': return '⚡';
      case 'water': return '💧';
      case 'gas': return '🔥';
      case 'steam': return '💨';
      default: return '📊';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-green-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const totalCost = meters.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Energy Management</h1>
        <p className="text-gray-600 mt-1">Monitor and optimize energy consumption</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Energy Cost</p>
              <p className="text-3xl font-bold text-gray-900">₱{(totalCost / 1000).toFixed(0)}K</p>
              <p className="text-xs text-green-600 mt-1">↓ 8% from last month</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Electricity</p>
              <p className="text-3xl font-bold text-gray-900">12.5K</p>
              <p className="text-xs text-gray-500 mt-1">kWh this month</p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Water</p>
              <p className="text-3xl font-bold text-gray-900">8.9K</p>
              <p className="text-xs text-gray-500 mt-1">m³ this month</p>
            </div>
            <div className="text-4xl">💧</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gas</p>
              <p className="text-3xl font-bold text-gray-900">3.2K</p>
              <p className="text-xs text-gray-500 mt-1">m³ this month</p>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumption Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="electricity" stroke="#3b82f6" strokeWidth={2} name="Electricity (kWh)" />
              <Line type="monotone" dataKey="water" stroke="#14b8a6" strokeWidth={2} name="Water (m³)" />
              <Line type="monotone" dataKey="gas" stroke="#f59e0b" strokeWidth={2} name="Gas (m³)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Consumption Pattern</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="consumption" fill="#8b5cf6" name="kWh" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Meters Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Energy Meters</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Reading</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {meters.map((meter) => (
              <tr key={meter.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{meter.name}</div>
                    <div className="text-xs text-gray-500">{meter.location}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getTypeIcon(meter.type)}</span>
                    <span className="text-sm text-gray-600 capitalize">{meter.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {meter.currentReading.toLocaleString()} {meter.unit}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">₱{meter.cost.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center text-sm font-medium ${getTrendColor(meter.trend)}`}>
                    <span className="text-xl mr-1">{getTrendIcon(meter.trend)}</span>
                    <span className="capitalize">{meter.trend}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{meter.lastUpdated}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">View Details</button>
                  <button className="text-gray-600 hover:text-gray-800">Export</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg shadow p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Energy Optimization Recommendations</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🌙</span>
              <h4 className="font-semibold text-gray-900">Off-Peak Usage</h4>
            </div>
            <p className="text-sm text-gray-600">
              Shift 30% of production to off-peak hours to save ₱15,000/month
            </p>
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">View Schedule →</button>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">❄️</span>
              <h4 className="font-semibold text-gray-900">HVAC Optimization</h4>
            </div>
            <p className="text-sm text-gray-600">
              Optimize HVAC setpoints to reduce consumption by 12%
            </p>
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">Configure →</button>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">💡</span>
              <h4 className="font-semibold text-gray-900">LED Upgrade</h4>
            </div>
            <p className="text-sm text-gray-600">
              Replace remaining fixtures for ₱8,000/month savings
            </p>
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">View ROI →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
