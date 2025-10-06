'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CalibrationRecord {
  id: string;
  assetId: string;
  assetName: string;
  calibrationType: string;
  calibrationDate: string;
  nextDueDate: string;
  status: 'compliant' | 'due_soon' | 'overdue' | 'failed';
  technician: string;
  standard: string;
  results: string;
  certificateNumber: string;
  toleranceMin: number;
  toleranceMax: number;
  actualValue: number;
  uncertainty: number;
  location: string;
}

export default function CalibrationPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<CalibrationRecord[]>([
    {
      id: '1',
      assetId: 'CT-SCAN-01',
      assetName: 'CT Scanner - Radiology',
      calibrationType: 'Radiation Output Calibration',
      calibrationDate: '2025-09-15',
      nextDueDate: '2026-09-15',
      status: 'compliant',
      technician: 'Dr. Jane Smith',
      standard: 'IEC 60601-2-44',
      results: 'Pass',
      certificateNumber: 'CAL-2025-001',
      toleranceMin: 95,
      toleranceMax: 105,
      actualValue: 100.2,
      uncertainty: 0.5,
      location: 'Radiology Department',
    },
    {
      id: '2',
      assetId: 'PUMP-001',
      assetName: 'Hydraulic Pump Unit A',
      calibrationType: 'Pressure Gauge Calibration',
      calibrationDate: '2025-08-20',
      nextDueDate: '2025-11-20',
      status: 'due_soon',
      technician: 'Mike Johnson',
      standard: 'ASME B40.100',
      results: 'Pass',
      certificateNumber: 'CAL-2025-002',
      toleranceMin: 98,
      toleranceMax: 102,
      actualValue: 99.8,
      uncertainty: 0.3,
      location: 'Production Line 1',
    },
    {
      id: '3',
      assetId: 'SCALE-001',
      assetName: 'Industrial Scale - Warehouse',
      calibrationType: 'Weight Calibration',
      calibrationDate: '2025-07-10',
      nextDueDate: '2025-10-10',
      status: 'overdue',
      technician: 'Tom Brown',
      standard: 'NIST Handbook 44',
      results: 'Pending',
      certificateNumber: 'CAL-2025-003',
      toleranceMin: 99.5,
      toleranceMax: 100.5,
      actualValue: 100.1,
      uncertainty: 0.2,
      location: 'Warehouse A',
    },
    {
      id: '4',
      assetId: 'TEMP-001',
      assetName: 'Temperature Controller - Lab',
      calibrationType: 'Temperature Calibration',
      calibrationDate: '2025-09-01',
      nextDueDate: '2026-03-01',
      status: 'compliant',
      technician: 'Sarah Williams',
      standard: 'ISO 17025',
      results: 'Pass',
      certificateNumber: 'CAL-2025-004',
      toleranceMin: -0.5,
      toleranceMax: 0.5,
      actualValue: 0.2,
      uncertainty: 0.1,
      location: 'Quality Lab',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CalibrationRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    assetId: '',
    assetName: '',
    calibrationType: '',
    calibrationDate: '',
    nextDueDate: '',
    technician: '',
    standard: '',
    certificateNumber: '',
    toleranceMin: 0,
    toleranceMax: 0,
    actualValue: 0,
    uncertainty: 0,
    location: '',
    results: 'Pass',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'due_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.calibrationType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: records.length,
    compliant: records.filter((r) => r.status === 'compliant').length,
    dueSoon: records.filter((r) => r.status === 'due_soon').length,
    overdue: records.filter((r) => r.status === 'overdue').length,
  };

  const handleCreateRecord = () => {
    if (!formData.assetId || !formData.calibrationDate || !formData.nextDueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const daysUntilDue = getDaysUntilDue(formData.nextDueDate);
    let status: CalibrationRecord['status'] = 'compliant';
    if (daysUntilDue < 0) status = 'overdue';
    else if (daysUntilDue <= 30) status = 'due_soon';

    const newRecord: CalibrationRecord = {
      id: String(records.length + 1),
      ...formData,
      status,
    };

    setRecords([...records, newRecord]);
    setIsModalOpen(false);
    setFormData({
      assetId: '',
      assetName: '',
      calibrationType: '',
      calibrationDate: '',
      nextDueDate: '',
      technician: '',
      standard: '',
      certificateNumber: '',
      toleranceMin: 0,
      toleranceMax: 0,
      actualValue: 0,
      uncertainty: 0,
      location: '',
      results: 'Pass',
    });
  };

  const handleViewDetails = (record: CalibrationRecord) => {
    setSelectedRecord(record);
  };

  const isWithinTolerance = (actual: number, min: number, max: number) => {
    return actual >= min && actual <= max;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calibration Management</h1>
        <p className="text-gray-600 mt-1">Track and manage equipment calibration schedules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Calibrations</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-4xl">🔬</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliant</p>
              <p className="text-3xl font-bold text-gray-900">{stats.compliant}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due Soon</p>
              <p className="text-3xl font-bold text-gray-900">{stats.dueSoon}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
            <div className="text-4xl">🚨</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search calibrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="compliant">Compliant</option>
              <option value="due_soon">Due Soon</option>
              <option value="overdue">Overdue</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold whitespace-nowrap"
          >
            ➕ Add Calibration
          </button>
        </div>
      </div>

      {/* Calibration Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calibration Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Calibrated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const daysUntilDue = getDaysUntilDue(record.nextDueDate);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.assetName}</div>
                        <div className="text-xs text-gray-500">{record.assetId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{record.calibrationType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{record.calibrationDate}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-600">{record.nextDueDate}</div>
                        <div className="text-xs text-gray-500">
                          {daysUntilDue > 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}
                      >
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-blue-600">{record.certificateNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        View Details
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">Download</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Calibration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Calibration Record</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset ID *</label>
                <input
                  type="text"
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., CT-SCAN-01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
                <input
                  type="text"
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Calibration Type *</label>
                <input
                  type="text"
                  value={formData.calibrationType}
                  onChange={(e) => setFormData({ ...formData, calibrationType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., Pressure Gauge Calibration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calibration Date *</label>
                <input
                  type="date"
                  value={formData.calibrationDate}
                  onChange={(e) => setFormData({ ...formData, calibrationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date *</label>
                <input
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                <input
                  type="text"
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
                <input
                  type="text"
                  value={formData.standard}
                  onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., ISO 17025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                <input
                  type="text"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., CAL-2025-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div className="col-span-2">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tolerance Min</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.toleranceMin}
                      onChange={(e) => setFormData({ ...formData, toleranceMin: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tolerance Max</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.toleranceMax}
                      onChange={(e) => setFormData({ ...formData, toleranceMax: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Value</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.actualValue}
                      onChange={(e) => setFormData({ ...formData, actualValue: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uncertainty (±)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.uncertainty}
                      onChange={(e) => setFormData({ ...formData, uncertainty: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
                <select
                  value={formData.results}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRecord}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Calibration Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Asset</p>
                <p className="text-lg font-semibold text-gray-900">{selectedRecord.assetName}</p>
                <p className="text-sm text-gray-500">{selectedRecord.assetId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Calibration Type</p>
                <p className="text-lg font-semibold text-gray-900">{selectedRecord.calibrationType}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Calibration Date</p>
                <p className="text-lg font-semibold text-gray-900">{selectedRecord.calibrationDate}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Next Due Date</p>
                <p className="text-lg font-semibold text-gray-900">{selectedRecord.nextDueDate}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Technician</p>
                <p className="text-lg font-semibold text-gray-900">{selectedRecord.technician}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Standard</p>
                <p className="text-lg font-semibold text-gray-900">{selectedRecord.standard}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Certificate Number</p>
                <p className="text-lg font-mono font-semibold text-blue-600">{selectedRecord.certificateNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-lg font-semibold text-gray-900">{selectedRecord.location}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Measurement Results</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Tolerance Range</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedRecord.toleranceMin} - {selectedRecord.toleranceMax}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Actual Value</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRecord.actualValue}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Uncertainty</p>
                  <p className="text-sm font-semibold text-gray-900">± {selectedRecord.uncertainty}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Result</p>
                  <p
                    className={`text-sm font-semibold ${
                      isWithinTolerance(
                        selectedRecord.actualValue,
                        selectedRecord.toleranceMin,
                        selectedRecord.toleranceMax
                      )
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {selectedRecord.results}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
