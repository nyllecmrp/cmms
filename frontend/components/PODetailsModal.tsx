'use client';

import { useEffect } from 'react';

interface PODetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  po: {
    poNumber: string;
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
    purchaseRequest?: {
      requestNumber: string;
      title: string;
    };
    createdBy?: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  };
}

export default function PODetailsModal({ isOpen, onClose, po }: PODetailsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let items: any[] = [];
  try {
    items = JSON.parse(po.items);
  } catch (e) {
    console.error('Failed to parse items:', e);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Purchase Order Details</h2>
              <p className="text-sm text-gray-600 mt-1">PO Number: {po.poNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Supplier Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Supplier Name:</span>
                  <p className="text-sm text-gray-900 mt-1">{po.supplierName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Contact Person:</span>
                  <p className="text-sm text-gray-900 mt-1">{po.supplierContact || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-sm text-gray-900 mt-1">{po.supplierEmail || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Address:</span>
                  <p className="text-sm text-gray-900 mt-1">{po.supplierAddress || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item: any, idx: number) => {
                    const unitPrice = item.estimatedCost || item.price || 0;
                    const quantity = item.quantity || 1;
                    const total = unitPrice * quantity;

                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {item.partNumber ? `${item.partNumber} - ` : ''}{item.name || item.componentName}
                          </div>
                          {item.classification && (
                            <div className="text-xs text-gray-500">{item.classification}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{quantity}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          ₱{unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                      Subtotal:
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                      ₱{(po.subtotal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                      Tax (12%):
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                      ₱{(po.tax || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-600">
                      Shipping:
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-semibold text-gray-900">
                      ₱{(po.shippingCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={3} className="px-4 py-3 text-right text-base font-bold text-gray-900">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right text-base font-bold text-blue-600">
                      ₱{(po.totalCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Payment Terms:</span>
                  <p className="text-sm text-gray-900 mt-1">{po.paymentTerms || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Shipping Method:</span>
                  <p className="text-sm text-gray-900 mt-1">{po.shippingMethod || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Order Date:</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {po.orderDate ? new Date(po.orderDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Expected Delivery:</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {po.actualDelivery && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Actual Delivery:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(po.actualDelivery).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {po.purchaseRequest && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Related PR:</span>
                    <p className="text-sm text-blue-600 mt-1">
                      {po.purchaseRequest.requestNumber} - {po.purchaseRequest.title}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Created By:</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {po.createdBy ? `${po.createdBy.firstName} ${po.createdBy.lastName}` : 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Created At:</span>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(po.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {po.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{po.notes}</p>
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          {po.termsAndConditions && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{po.termsAndConditions}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
