'use client';

import { useState } from 'react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  totalContracts: number;
  totalSpent: number;
  services: string[];
  certifications?: string[];
  lastServiceDate?: string;
}

interface VendorContract {
  id: string;
  vendorId: string;
  contractNumber: string;
  serviceType: string;
  startDate: string;
  endDate: string;
  value: number;
  status: 'active' | 'expired' | 'pending';
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: '1',
      name: 'Acme Maintenance Services',
      category: 'Maintenance Provider',
      contactPerson: 'Robert Chen',
      email: 'robert@acmemaintenance.com',
      phone: '+63 917 123 4567',
      address: 'Makati City, Metro Manila',
      rating: 4.8,
      status: 'active',
      totalContracts: 12,
      totalSpent: 450000,
      services: ['Preventive Maintenance', 'Repairs', 'Emergency Service'],
      certifications: ['ISO 9001', 'ISO 14001'],
      lastServiceDate: '2025-09-28',
    },
    {
      id: '2',
      name: 'TechParts Supply Inc.',
      category: 'Parts Supplier',
      contactPerson: 'Maria Santos',
      email: 'maria@techparts.ph',
      phone: '+63 918 234 5678',
      address: 'Quezon City, Metro Manila',
      rating: 4.5,
      status: 'active',
      totalContracts: 8,
      totalSpent: 320000,
      services: ['Spare Parts', 'Equipment Supply', 'Logistics'],
      certifications: ['ISO 9001'],
      lastServiceDate: '2025-10-01',
    },
    {
      id: '3',
      name: 'Global Calibration Services',
      category: 'Calibration Services',
      contactPerson: 'James Lee',
      email: 'james@globalcal.com',
      phone: '+63 919 345 6789',
      address: 'BGC, Taguig City',
      rating: 5.0,
      status: 'active',
      totalContracts: 5,
      totalSpent: 180000,
      services: ['Equipment Calibration', 'Testing', 'Certification'],
      certifications: ['ISO 17025', 'NABL Accredited'],
      lastServiceDate: '2025-09-15',
    },
    {
      id: '4',
      name: 'Safety First Solutions',
      category: 'Safety Equipment',
      contactPerson: 'Anna Reyes',
      email: 'anna@safetyfirst.ph',
      phone: '+63 920 456 7890',
      address: 'Pasig City, Metro Manila',
      rating: 4.2,
      status: 'pending',
      totalContracts: 3,
      totalSpent: 95000,
      services: ['PPE Supply', 'Safety Training', 'Safety Audits'],
      certifications: ['CE Certified'],
    },
  ]);

  const [contracts] = useState<VendorContract[]>([
    {
      id: '1',
      vendorId: '1',
      contractNumber: 'CNT-2025-001',
      serviceType: 'Annual Maintenance Contract',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      value: 380000,
      status: 'active',
    },
    {
      id: '2',
      vendorId: '2',
      contractNumber: 'CNT-2025-002',
      serviceType: 'Parts Supply Agreement',
      startDate: '2025-03-01',
      endDate: '2026-02-28',
      value: 280000,
      status: 'active',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Maintenance Provider',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    services: '',
  });

  const categories = [
    'Maintenance Provider',
    'Parts Supplier',
    'Calibration Services',
    'Safety Equipment',
    'HVAC Services',
    'Electrical Services',
    'Plumbing Services',
    'Other',
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < fullStars ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const handleCreateVendor = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const newVendor: Vendor = {
      id: String(vendors.length + 1),
      ...formData,
      services: formData.services.split(',').map(s => s.trim()),
      rating: 0,
      status: 'pending',
      totalContracts: 0,
      totalSpent: 0,
    };

    setVendors([...vendors, newVendor]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: 'Maintenance Provider',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      services: '',
    });
  };

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    totalSpent: vendors.reduce((sum, v) => sum + v.totalSpent, 0),
    avgRating: (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1),
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
        <p className="text-gray-600 mt-1">Manage service providers and supplier relationships</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vendors</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-4xl">🏢</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Vendors</p>
              <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900">₱{(stats.totalSpent / 1000).toFixed(0)}K</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgRating}⭐</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            ➕ Add Vendor
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contracts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                    <div className="text-xs text-gray-500">{vendor.services.join(', ')}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{vendor.category}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{vendor.contactPerson}</div>
                  <div className="text-xs text-gray-500">{vendor.email}</div>
                  <div className="text-xs text-gray-500">{vendor.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRatingStars(vendor.rating)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{vendor.totalContracts}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">₱{vendor.totalSpent.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedVendor(vendor)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Details
                  </button>
                  <button className="text-gray-600 hover:text-gray-800">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedVendor.name}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="text-lg font-semibold text-gray-900">{selectedVendor.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedVendor.status)}`}>
                  {selectedVendor.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Person</p>
                <p className="text-lg font-semibold text-gray-900">{selectedVendor.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <div>{getRatingStars(selectedVendor.rating)}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Email:</span> {selectedVendor.email}</p>
                <p><span className="text-gray-600">Phone:</span> {selectedVendor.phone}</p>
                <p><span className="text-gray-600">Address:</span> {selectedVendor.address}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Services Provided</h3>
              <div className="flex flex-wrap gap-2">
                {selectedVendor.services.map((service, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {selectedVendor.certifications && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedVendor.certifications.map((cert, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{selectedVendor.totalContracts}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₱{selectedVendor.totalSpent.toLocaleString()}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedVendor(null)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Vendor</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services (comma separated)</label>
                <input
                  type="text"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., Maintenance, Repairs, Parts Supply"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateVendor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
