'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import ItemsModal from '@/components/ItemsModal';
import SupplierItemsGrouping from '@/components/SupplierItemsGrouping';
import PODetailsModal from '@/components/PODetailsModal';

interface PurchaseRequest {
  id: string;
  requestNumber: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  type: string;
  items: string;
  estimatedCost?: number;
  actualCost?: number;
  requestedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  pmSchedule?: {
    id: string;
    name: string;
  };
  workOrder?: {
    id: string;
    workOrderNumber: string;
    title: string;
  };
  asset?: {
    id: string;
    name: string;
    assetNumber: string;
  };
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  purchasedAt?: string;
  notes?: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  purchased: number;
  totalSpent: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  purchaseRequestId?: string;
  supplierName: string;
  supplierContact?: string;
  supplierEmail?: string;
  supplierAddress?: string;
  items: string;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  totalCost?: number;
  status: string;
  orderDate?: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  termsAndConditions?: string;
  paymentTerms?: string;
  shippingMethod?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  purchaseRequest?: {
    id: string;
    requestNumber: string;
    title: string;
  };
  createdAt: string;
}

export default function ProcurementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'purchase-requests' | 'purchase-orders' | 'suppliers'>('purchase-requests');
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, purchased: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [itemsModalTitle, setItemsModalTitle] = useState('');
  const [itemsModalAdditionalInfo, setItemsModalAdditionalInfo] = useState<any>(null);
  const [showSupplierGrouping, setShowSupplierGrouping] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [showPODetailsModal, setShowPODetailsModal] = useState(false);
  const [selectedPOForDetails, setSelectedPOForDetails] = useState<PurchaseOrder | null>(null);
  const [poFormData, setPoFormData] = useState({
    supplierName: '',
    supplierEmail: '',
    supplierContact: '',
    supplierAddress: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    notes: '',
    paymentTerms: '30 days',
    shippingMethod: 'Standard',
    shippingCost: '0',
    termsAndConditions: 'Standard terms and conditions apply.',
  });

  // Fetch purchase requests and stats
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.organizationId) return;

      try {
        setLoading(true);
        const [requestsData, statsData, ordersData] = await Promise.all([
          api.getPurchaseRequests(user.organizationId),
          api.getPurchaseRequestStats(user.organizationId),
          api.getPurchaseOrders(user.organizationId),
        ]);
        setPurchaseRequests(requestsData as PurchaseRequest[]);
        setStats(statsData as Stats);
        setPurchaseOrders(ordersData as PurchaseOrder[]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.organizationId]);

  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchSuppliers();
    }
  }, [activeTab]);

  const fetchPurchaseOrders = async () => {
    if (!user?.organizationId) return;
    try {
      const data = await api.getPurchaseOrders(user.organizationId);
      setPurchaseOrders(data as PurchaseOrder[]);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    }
  };

  const handleApprove = async (id: string) => {
    if (!user?.id) return;
    try {
      await api.approvePurchaseRequest(id, user.id);
      // Refresh data
      const requestsData = await api.getPurchaseRequests(user.organizationId);
      setPurchaseRequests(requestsData as PurchaseRequest[]);
      const statsData = await api.getPurchaseRequestStats(user.organizationId);
      setStats(statsData as Stats);
    } catch (error) {
      console.error('Failed to approve purchase request:', error);
      alert('Failed to approve purchase request');
    }
  };

  const handleReject = async (id: string) => {
    if (!user?.id) return;
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await api.rejectPurchaseRequest(id, user.id, reason);
      // Refresh data
      const requestsData = await api.getPurchaseRequests(user.organizationId);
      setPurchaseRequests(requestsData as PurchaseRequest[]);
      const statsData = await api.getPurchaseRequestStats(user.organizationId);
      setStats(statsData as Stats);
    } catch (error) {
      console.error('Failed to reject purchase request:', error);
      alert('Failed to reject purchase request');
    }
  };

  const handleMarkPurchased = async (id: string) => {
    const costStr = prompt('Enter actual cost (optional):');
    const actualCost = costStr ? parseFloat(costStr) : undefined;

    try {
      await api.markPurchaseRequestAsPurchased(id, actualCost);
      // Refresh data
      const requestsData = await api.getPurchaseRequests(user!.organizationId);
      setPurchaseRequests(requestsData as PurchaseRequest[]);
      const statsData = await api.getPurchaseRequestStats(user!.organizationId);
      setStats(statsData as Stats);
    } catch (error) {
      console.error('Failed to mark as purchased:', error);
      alert('Failed to mark as purchased');
    }
  };


  const fetchSuppliers = async () => {
    if (!user?.organizationId) return;

    try {
      setLoadingSuppliers(true);
      const data = await api.getSuppliers(user.organizationId);
      setSuppliers(data as any[]);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleGeneratePO = (pr: PurchaseRequest) => {
    setSelectedPR(pr);
    setShowSupplierGrouping(true);
  };

  const handleGenerateGroupedPOs = async (groupedItems: { [supplier: string]: any[] }) => {
    if (!user?.id || !user?.organizationId || !selectedPR) return;

    try {
      let successCount = 0;
      let totalActualCost = 0;
      const suppliers = Object.keys(groupedItems);
      const allUpdatedItems: any[] = [];

      for (const supplier of suppliers) {
        const items = groupedItems[supplier];
        allUpdatedItems.push(...items);
        const subtotal = items.reduce((sum: number, item: any) =>
          sum + ((item.estimatedCost || item.price || 0) * (item.quantity || 1)), 0);
        const tax = subtotal * 0.12;
        const totalCost = subtotal + tax;
        totalActualCost += totalCost;

        await api.createPurchaseOrder({
          organizationId: user.organizationId,
          purchaseRequestId: selectedPR.id,
          supplierName: supplier,
          supplierContact: '',
          supplierEmail: '',
          supplierAddress: '',
          items: JSON.stringify(items),
          subtotal: subtotal,
          tax: tax,
          shippingCost: 0,
          totalCost: totalCost,
          orderDate: new Date().toISOString().split('T')[0],
          expectedDelivery: '',
          notes: `Auto-generated from PR ${selectedPR.requestNumber}`,
          termsAndConditions: 'Standard terms and conditions apply.',
          paymentTerms: '30 days',
          shippingMethod: 'Standard',
          createdById: user.id,
        });

        successCount++;
      }

      // Update the Purchase Request with actual costs
      await api.updatePurchaseRequest(selectedPR.id, {
        estimatedCost: totalActualCost,
        items: JSON.stringify(allUpdatedItems)
      });

      alert(`Successfully created ${successCount} Purchase Order(s) for ${successCount} supplier(s)`);
      setShowSupplierGrouping(false);
      setSelectedPR(null);
      await fetchPurchaseOrders();

      // Refresh purchase requests to show updated cost
      const requestsData = await api.getPurchaseRequests(user.organizationId);
      setPurchaseRequests(requestsData as PurchaseRequest[]);
      const statsData = await api.getPurchaseRequestStats(user.organizationId);
      setStats(statsData as Stats);
    } catch (error: any) {
      console.error('Failed to create POs:', error);
      alert(`Failed to create POs: ${error.message}`);
    }
  };

  const handleCreatePO = async () => {
    if (!user?.id || !user?.organizationId) return;

    try {
      const items = selectedPR?.items || '[]';
      const parsedItems = JSON.parse(items);
      const subtotal = parsedItems.reduce((sum: number, item: any) =>
        sum + (item.estimatedCost * item.quantity), 0);
      const tax = subtotal * 0.12; // 12% tax
      const totalCost = subtotal + tax + (parseFloat(poFormData.shippingCost || '0'));

      await api.createPurchaseOrder({
        organizationId: user.organizationId,
        purchaseRequestId: selectedPR?.id,
        supplierName: poFormData.supplierName,
        supplierContact: poFormData.supplierContact,
        supplierEmail: poFormData.supplierEmail,
        supplierAddress: poFormData.supplierAddress,
        items: items,
        subtotal: subtotal,
        tax: tax,
        shippingCost: parseFloat(poFormData.shippingCost || '0'),
        totalCost: totalCost,
        orderDate: poFormData.orderDate,
        expectedDelivery: poFormData.expectedDelivery,
        notes: poFormData.notes,
        termsAndConditions: poFormData.termsAndConditions,
        paymentTerms: poFormData.paymentTerms,
        shippingMethod: poFormData.shippingMethod,
        createdById: user.id,
      });

      alert('Purchase Order created successfully!');
      setShowPOModal(false);
      setSelectedPR(null);
      setPoFormData({
        supplierName: '',
        supplierEmail: '',
        supplierContact: '',
        supplierAddress: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: '',
        notes: '',
        paymentTerms: '30 days',
        shippingMethod: 'Standard',
        shippingCost: '0',
        termsAndConditions: 'Standard terms and conditions apply.',
      });
      await fetchPurchaseOrders();
    } catch (error: any) {
      console.error('Failed to create PO:', error);
      alert(`Failed to create PO: ${error.message}`);
    }
  };

  const handleSendPO = async (po: PurchaseOrder) => {
    if (!user?.id) return;
    if (!confirm(`Send PO ${po.poNumber} to supplier?`)) return;

    try {
      await api.sendPurchaseOrder(po.id, user.id);
      alert('Purchase Order sent to supplier!');
      await fetchPurchaseOrders();
    } catch (error: any) {
      console.error('Failed to send PO:', error);
      alert(`Failed to send PO: ${error.message}`);
    }
  };

  const handleReceivePO = async (po: PurchaseOrder) => {
    if (!user?.id) return;
    const actualDelivery = prompt('Enter actual delivery date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!actualDelivery) return;

    try {
      await api.receivePurchaseOrder(po.id, user.id, actualDelivery);
      alert('Purchase Order marked as received!');
      await fetchPurchaseOrders();
    } catch (error: any) {
      console.error('Failed to receive PO:', error);
      alert(`Failed to receive PO: ${error.message}`);
    }
  };

  const handleCancelPO = async (po: PurchaseOrder) => {
    if (!confirm(`Cancel PO ${po.poNumber}?`)) return;

    try {
      await api.cancelPurchaseOrder(po.id);
      alert('Purchase Order cancelled!');
      await fetchPurchaseOrders();
    } catch (error: any) {
      console.error('Failed to cancel PO:', error);
      alert(`Failed to cancel PO: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'purchased': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPOStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement</h1>
          <p className="text-gray-600 mt-1">Purchase orders & vendor management</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
          + New Purchase Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Requests</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">All purchase requests</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats.pending}</div>
          <div className="text-xs text-gray-500 mt-1">Awaiting review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Approved</div>
          <div className="text-2xl font-bold text-green-600">{loading ? '...' : stats.approved}</div>
          <div className="text-xs text-gray-500 mt-1">Ready to purchase</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Spent</div>
          <div className="text-2xl font-bold text-blue-600">{loading ? '...' : `₱${stats.totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
          <div className="text-xs text-gray-500 mt-1">{stats.purchased} purchased</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'purchase-requests', name: 'Purchase Requests', icon: '📋' },
              { id: 'purchase-orders', name: 'Purchase Orders', icon: '🛒' },
              { id: 'suppliers', name: 'Suppliers', icon: '🏢' },
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

        <div className="p-6">
          {activeTab === 'purchase-requests' && (
            <div>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading purchase requests...</div>
              ) : purchaseRequests.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Purchase Requests Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Purchase requests will appear here when you create PM schedules with parts or submit manual requests.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimated Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {purchaseRequests.map((request) => {
                        let items: any[] = [];
                        try {
                          items = JSON.parse(request.items);
                        } catch (e) {
                          console.error('Failed to parse items:', e);
                        }

                        return (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{request.requestNumber}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{request.title}</div>
                              {request.pmSchedule && (
                                <div className="text-xs text-blue-600">PM: {request.pmSchedule.name}</div>
                              )}
                              {request.description && (
                                <div className="text-xs text-gray-500">{request.description}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600 capitalize">{request.type}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                ₱{request.estimatedCost?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                              </div>
                              <div className="text-xs text-gray-500">{items.length} item(s)</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">
                                {request.requestedBy
                                  ? `${request.requestedBy.firstName} ${request.requestedBy.lastName}`
                                  : 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              {request.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(request.id)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(request.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {request.status === 'approved' && (
                                <>
                                  <button
                                    onClick={() => handleGeneratePO(request)}
                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                  >
                                    Generate PO
                                  </button>
                                  <button
                                    onClick={() => handleMarkPurchased(request.id)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    Mark Purchased
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedItems(items);
                                  setItemsModalTitle(`Items for ${request.requestNumber}`);
                                  setItemsModalAdditionalInfo({
                                    title: request.title,
                                    requestNumber: request.requestNumber,
                                    estimatedCost: request.estimatedCost,
                                  });
                                  setShowItemsModal(true);
                                }}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                View Items
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}


          {activeTab === 'suppliers' && (
            <div>
              {loadingSuppliers ? (
                <div className="text-center py-8 text-gray-500">Loading suppliers...</div>
              ) : suppliers.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Suppliers Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Add suppliers to streamline your purchase order generation process.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Person</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Terms</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {suppliers.map((supplier: any) => (
                        <tr key={supplier.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                            {supplier.city && (
                              <div className="text-xs text-gray-500">{supplier.city}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{supplier.contactPerson || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{supplier.email || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{supplier.phone || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{supplier.supplierType || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{supplier.paymentTerms || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {supplier.rating && Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < supplier.rating ? 'text-yellow-400' : 'text-gray-300'}>⭐</span>
                              ))}
                              {!supplier.rating && <span className="text-sm text-gray-400">No rating</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {supplier.status || 'active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchase-orders' && (
            <div>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading purchase orders...</div>
              ) : purchaseOrders.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Purchase Orders Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Generate purchase orders from approved purchase requests to track your procurement process.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Delivery</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {purchaseOrders.map((po) => {
                        let items: any[] = [];
                        try {
                          items = JSON.parse(po.items);
                        } catch (e) {
                          console.error('Failed to parse items:', e);
                        }

                        return (
                          <tr key={po.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{po.poNumber}</div>
                              {po.purchaseRequest && (
                                <div className="text-xs text-blue-600">PR: {po.purchaseRequest.requestNumber}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{po.supplierName}</div>
                              {po.supplierEmail && (
                                <div className="text-xs text-gray-500">{po.supplierEmail}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getPOStatusColor(po.status)}`}>
                                {po.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                ₱{po.totalCost?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                              </div>
                              <div className="text-xs text-gray-500">{items.length} item(s)</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">
                                {po.orderDate ? new Date(po.orderDate).toLocaleDateString() : '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">
                                {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">
                                {po.createdBy
                                  ? `${po.createdBy.firstName} ${po.createdBy.lastName}`
                                  : 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              {po.status === 'draft' && (
                                <>
                                  <button
                                    onClick={() => handleSendPO(po)}
                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                  >
                                    Send to Supplier
                                  </button>
                                  <button
                                    onClick={() => handleCancelPO(po)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {(po.status === 'sent' || po.status === 'confirmed' || po.status === 'shipped') && (
                                <>
                                  <button
                                    onClick={() => handleReceivePO(po)}
                                    className="text-green-600 hover:text-green-800 font-semibold"
                                  >
                                    Mark Received
                                  </button>
                                  <button
                                    onClick={() => handleCancelPO(po)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedPOForDetails(po);
                                  setShowPODetailsModal(true);
                                }}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PO Modal */}
      {showPOModal && selectedPR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Generate Purchase Order</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    From PR: {selectedPR.requestNumber} - {selectedPR.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPOModal(false);
                    setSelectedPR(null);
                    setPoFormData({
                      supplierName: '',
                      supplierEmail: '',
                      supplierContact: '',
                      supplierAddress: '',
                      orderDate: new Date().toISOString().split('T')[0],
                      expectedDelivery: '',
                      notes: '',
                      paymentTerms: '30 days',
                      shippingMethod: 'Standard',
                      shippingCost: '0',
                      termsAndConditions: 'Standard terms and conditions apply.',
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Supplier Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      value={poFormData.supplierName}
                      onChange={(e) => setPoFormData({ ...poFormData, supplierName: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier Email
                    </label>
                    <input
                      type="email"
                      value={poFormData.supplierEmail}
                      onChange={(e) => setPoFormData({ ...poFormData, supplierEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="supplier@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier Contact
                    </label>
                    <input
                      type="text"
                      value={poFormData.supplierContact}
                      onChange={(e) => setPoFormData({ ...poFormData, supplierContact: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="+63 xxx xxxx xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier Address
                    </label>
                    <input
                      type="text"
                      value={poFormData.supplierAddress}
                      onChange={(e) => setPoFormData({ ...poFormData, supplierAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Street, City, Country"
                    />
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Date *
                    </label>
                    <input
                      type="date"
                      value={poFormData.orderDate}
                      onChange={(e) => setPoFormData({ ...poFormData, orderDate: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery
                    </label>
                    <input
                      type="date"
                      value={poFormData.expectedDelivery}
                      onChange={(e) => setPoFormData({ ...poFormData, expectedDelivery: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={poFormData.paymentTerms}
                      onChange={(e) => setPoFormData({ ...poFormData, paymentTerms: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="e.g., 30 days, COD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Method
                    </label>
                    <input
                      type="text"
                      value={poFormData.shippingMethod}
                      onChange={(e) => setPoFormData({ ...poFormData, shippingMethod: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="e.g., Standard, Express"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Cost (₱)
                    </label>
                    <input
                      type="number"
                      value={poFormData.shippingCost}
                      onChange={(e) => setPoFormData({ ...poFormData, shippingCost: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Items from PR */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {(() => {
                    try {
                      const items = JSON.parse(selectedPR.items);
                      return (
                        <div className="space-y-2">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.name} (Qty: {item.quantity})
                              </span>
                              <span className="font-semibold text-gray-900">
                                ₱{((item.estimatedCost || item.price || 0) * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-gray-300 pt-2 mt-2">
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Estimated Total:</span>
                              <span>₱{selectedPR.estimatedCost?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      );
                    } catch (e) {
                      return <p className="text-gray-500">Unable to parse items</p>;
                    }
                  })()}
                </div>
              </div>

              {/* Notes and Terms */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={poFormData.notes}
                      onChange={(e) => setPoFormData({ ...poFormData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Any additional notes or special instructions"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms and Conditions
                    </label>
                    <textarea
                      value={poFormData.termsAndConditions}
                      onChange={(e) => setPoFormData({ ...poFormData, termsAndConditions: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Terms and conditions for this purchase order"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPOModal(false);
                  setSelectedPR(null);
                  setPoFormData({
                    supplierName: '',
                    supplierEmail: '',
                    supplierContact: '',
                    supplierAddress: '',
                    orderDate: new Date().toISOString().split('T')[0],
                    expectedDelivery: '',
                    notes: '',
                    paymentTerms: '30 days',
                    shippingMethod: 'Standard',
                    shippingCost: '0',
                    termsAndConditions: 'Standard terms and conditions apply.',
                  });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePO}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Generate Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Supplier Items Grouping Modal */}
      {showSupplierGrouping && selectedPR && (
        <SupplierItemsGrouping
          isOpen={showSupplierGrouping}
          onClose={() => {
            setShowSupplierGrouping(false);
            setSelectedPR(null);
          }}
          items={JSON.parse(selectedPR.items || '[]')}
          onGeneratePOs={handleGenerateGroupedPOs}
        />
      )}

      {/* Items Modal */}
      <ItemsModal
        isOpen={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        title={itemsModalTitle}
        items={selectedItems}
        additionalInfo={itemsModalAdditionalInfo}
      />

      {/* PO Details Modal */}
      {selectedPOForDetails && (
        <PODetailsModal
          isOpen={showPODetailsModal}
          onClose={() => {
            setShowPODetailsModal(false);
            setSelectedPOForDetails(null);
          }}
          po={selectedPOForDetails}
        />
      )}
    </div>
  );
}

