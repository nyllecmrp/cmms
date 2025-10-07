'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FileUpload from '@/components/FileUpload';

interface Document {
  id: string;
  title: string;
  category: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  assetId?: string;
  tags: string[];
  version: string;
  status: 'active' | 'archived' | 'expired';
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Preventive Maintenance SOP',
      category: 'Standard Operating Procedure',
      type: 'PDF',
      size: '2.4 MB',
      uploadedBy: 'John Smith',
      uploadedAt: '2025-09-15',
      tags: ['SOP', 'Maintenance', 'Safety'],
      version: '2.1',
      status: 'active',
    },
    {
      id: '2',
      title: 'Equipment Calibration Certificate',
      category: 'Certificates',
      type: 'PDF',
      size: '1.8 MB',
      uploadedBy: 'Jane Doe',
      uploadedAt: '2025-09-20',
      assetId: 'PUMP-001',
      tags: ['Calibration', 'Certificate', 'Compliance'],
      version: '1.0',
      status: 'active',
    },
    {
      id: '3',
      title: 'Safety Inspection Checklist',
      category: 'Checklists',
      type: 'DOCX',
      size: '0.5 MB',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2025-09-18',
      tags: ['Safety', 'Inspection', 'Checklist'],
      version: '3.0',
      status: 'active',
    },
    {
      id: '4',
      title: 'Asset Purchase Agreement',
      category: 'Contracts',
      type: 'PDF',
      size: '3.2 MB',
      uploadedBy: 'Sarah Williams',
      uploadedAt: '2025-08-10',
      assetId: 'CT-SCAN-01',
      tags: ['Contract', 'Purchase', 'Legal'],
      version: '1.0',
      status: 'archived',
    },
    {
      id: '5',
      title: 'Work Instruction - Pump Maintenance',
      category: 'Work Instructions',
      type: 'PDF',
      size: '1.2 MB',
      uploadedBy: 'Tom Brown',
      uploadedAt: '2025-09-25',
      assetId: 'PUMP-001',
      tags: ['Work Instruction', 'Pump', 'Maintenance'],
      version: '1.5',
      status: 'active',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    category: 'Standard Operating Procedure',
    tags: '',
    assetId: '',
    version: '1.0',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const categories = [
    'Standard Operating Procedure',
    'Work Instructions',
    'Certificates',
    'Checklists',
    'Contracts',
    'Reports',
    'Manuals',
    'Drawings',
    'Other',
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF':
        return '📄';
      case 'DOCX':
      case 'DOC':
        return '📝';
      case 'XLSX':
      case 'XLS':
        return '📊';
      case 'JPG':
      case 'PNG':
      case 'JPEG':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const handleFileSelect = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleUploadSubmit = () => {
    if (!uploadFormData.title || uploadedFiles.length === 0) {
      alert('Please provide a title and select at least one file');
      return;
    }

    // Mock upload - in production, this would upload to server
    const newDoc: Document = {
      id: String(documents.length + 1),
      title: uploadFormData.title,
      category: uploadFormData.category,
      type: uploadedFiles[0].name.split('.').pop()?.toUpperCase() || 'FILE',
      size: `${(uploadedFiles[0].size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedBy: user ? `${user.firstName} ${user.lastName}` : 'Current User',
      uploadedAt: new Date().toISOString().split('T')[0],
      assetId: uploadFormData.assetId || undefined,
      tags: uploadFormData.tags.split(',').map((tag) => tag.trim()),
      version: uploadFormData.version,
      status: 'active',
    };

    setDocuments([newDoc, ...documents]);
    setIsUploadModalOpen(false);
    setUploadFormData({
      title: '',
      category: 'Standard Operating Procedure',
      tags: '',
      assetId: '',
      version: '1.0',
    });
    setUploadedFiles([]);
  };

  const handleDownload = (docId: string) => {
    alert(`Downloading document ${docId}... (Feature coming soon)`);
  };

  const handleArchive = (docId: string) => {
    setDocuments(
      documents.map((doc) => (doc.id === docId ? { ...doc, status: 'archived' as const } : doc))
    );
  };

  const handleDelete = (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter((doc) => doc.id !== docId));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-600 mt-1">Centralized storage for all maintenance documentation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Documents</p>
              <p className="text-3xl font-bold text-gray-900">
                {documents.filter((d) => d.status === 'active').length}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="text-4xl">📂</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-3xl font-bold text-gray-900">9.1 MB</p>
            </div>
            <div className="text-4xl">💾</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold whitespace-nowrap"
          >
            📤 Upload Document
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getFileIcon(doc.type)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        <div className="text-xs text-gray-500">
                          {doc.type} • {doc.size}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{doc.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{doc.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">v{doc.version}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{doc.uploadedBy}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{doc.uploadedAt}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDownload(doc.id)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Download
                    </button>
                    {doc.status === 'active' && (
                      <button
                        onClick={() => handleArchive(doc.id)}
                        className="text-yellow-600 hover:text-yellow-800 mr-3"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Document</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., Equipment Manual"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={uploadFormData.category}
                    onChange={(e) =>
                      setUploadFormData({ ...uploadFormData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={uploadFormData.version}
                    onChange={(e) =>
                      setUploadFormData({ ...uploadFormData, version: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadFormData.tags}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., SOP, Safety, Maintenance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linked Asset (Optional)
                </label>
                <input
                  type="text"
                  value={uploadFormData.assetId}
                  onChange={(e) =>
                    setUploadFormData({ ...uploadFormData, assetId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., PUMP-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files *
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  multiple={false}
                  maxSize={10}
                  maxFiles={1}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
