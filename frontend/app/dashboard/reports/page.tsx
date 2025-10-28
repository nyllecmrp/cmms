'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [hasData, setHasData] = useState(false);

  // Empty data - will be replaced with real data from backend in future
  const workOrderTrends = [
    { month: 'Jan', completed: 0, pending: 0, overdue: 0 },
    { month: 'Feb', completed: 0, pending: 0, overdue: 0 },
    { month: 'Mar', completed: 0, pending: 0, overdue: 0 },
    { month: 'Apr', completed: 0, pending: 0, overdue: 0 },
    { month: 'May', completed: 0, pending: 0, overdue: 0 },
    { month: 'Jun', completed: 0, pending: 0, overdue: 0 },
  ];

  const assetStatusData = [
    { name: 'Operational', value: 0, color: '#10b981' },
    { name: 'Maintenance', value: 0, color: '#f59e0b' },
    { name: 'Down', value: 0, color: '#ef4444' },
    { name: 'Retired', value: 0, color: '#6b7280' },
  ];

  const costAnalysis = [
    { month: 'Jan', labor: 0, parts: 0, external: 0 },
    { month: 'Feb', labor: 0, parts: 0, external: 0 },
    { month: 'Mar', labor: 0, parts: 0, external: 0 },
    { month: 'Apr', labor: 0, parts: 0, external: 0 },
    { month: 'May', labor: 0, parts: 0, external: 0 },
    { month: 'Jun', labor: 0, parts: 0, external: 0 },
  ];

  const mttrData = [
    { week: 'Week 1', mttr: 0 },
    { week: 'Week 2', mttr: 0 },
    { week: 'Week 3', mttr: 0 },
    { week: 'Week 4', mttr: 0 },
    { week: 'Week 5', mttr: 0 },
    { week: 'Week 6', mttr: 0 },
  ];

  const assetCategoryData = [
    { category: 'Equipment', count: 0, color: '#3b82f6' },
    { category: 'Facilities', count: 0, color: '#8b5cf6' },
    { category: 'Vehicles', count: 0, color: '#ec4899' },
    { category: 'IT Assets', count: 0, color: '#14b8a6' },
    { category: 'Others', count: 0, color: '#f97316' },
  ];

  const pmComplianceData = [
    { month: 'Jan', scheduled: 0, completed: 0, missed: 0 },
    { month: 'Feb', scheduled: 0, completed: 0, missed: 0 },
    { month: 'Mar', scheduled: 0, completed: 0, missed: 0 },
    { month: 'Apr', scheduled: 0, completed: 0, missed: 0 },
    { month: 'May', scheduled: 0, completed: 0, missed: 0 },
    { month: 'Jun', scheduled: 0, completed: 0, missed: 0 },
  ];

  const topAssetsByDowntime = [];

  const exportReport = (format: string) => {
    alert(`Exporting report as ${format.toUpperCase()}... (Feature coming soon)`);
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>

            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="overview">Overview</option>
              <option value="assets">Asset Performance</option>
              <option value="maintenance">Maintenance Analysis</option>
              <option value="costs">Cost Analysis</option>
              <option value="compliance">Compliance Report</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => exportReport('pdf')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              📄 Export PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              📊 Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Work Order Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">94.3%</p>
              <p className="text-xs text-green-600 mt-1">↑ 2.5% from last month</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">MTTR (Mean Time to Repair)</p>
              <p className="text-3xl font-bold text-gray-900">3.7h</p>
              <p className="text-xs text-green-600 mt-1">↓ 0.8h from last month</p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">PM Compliance Rate</p>
              <p className="text-3xl font-bold text-gray-900">98.3%</p>
              <p className="text-xs text-green-600 mt-1">↑ 1.2% from last month</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Maintenance Cost</p>
              <p className="text-3xl font-bold text-gray-900">₱125K</p>
              <p className="text-xs text-red-600 mt-1">↑ 5.3% from last month</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Work Order Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Order Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={workOrderTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" />
              <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
              <Area type="monotone" dataKey="overdue" stackId="1" stroke="#ef4444" fill="#ef4444" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {assetStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="labor" fill="#3b82f6" />
              <Bar dataKey="parts" fill="#8b5cf6" />
              <Bar dataKey="external" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MTTR Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mean Time to Repair (MTTR) Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mttrData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mttr" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assetCategoryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6">
                {assetCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PM Compliance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preventive Maintenance Compliance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pmComplianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="scheduled" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="missed" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Assets by Downtime */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Assets by Downtime (Last 30 Days)</h3>
        <div className="space-y-4">
          {topAssetsByDowntime.map((item, index) => (
            <div key={item.asset} className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold mr-4">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{item.asset}</span>
                  <span className="text-sm font-semibold text-red-600">{item.hours}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(item.hours / 50) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Reports Section */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📧 Schedule Automated Reports</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get regular reports delivered to your inbox automatically
            </p>
            <button 
              onClick={() => alert('Email report configuration coming soon!')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Configure Email Reports
            </button>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Next scheduled report</div>
            <div className="text-lg font-semibold text-gray-900">Monday, 9:00 AM</div>
          </div>
        </div>
      </div>
    </div>
  );
}
