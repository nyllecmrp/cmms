import { useEffect } from 'react';

interface ItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: any[];
  additionalInfo?: {
    supplier?: string;
    contact?: string;
    email?: string;
    paymentTerms?: string;
    shippingMethod?: string;
    notes?: string;
  };
}

export default function ItemsModal({ isOpen, onClose, title, items, additionalInfo }: ItemsModalProps) {
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

  const totalCost = items.reduce((sum, item) =>
    sum + ((item.estimatedCost || item.price || 0) * (item.quantity || 1)), 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Items Details</h2>
            <p className="text-sm text-gray-600 mt-1">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Items Table */}
        <div className="p-6">
          <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Part Number & Name</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Unit Cost</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => {
                  const unitCost = item.estimatedCost || item.price || 0;
                  const quantity = item.quantity || 1;
                  const total = unitCost * quantity;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.classification && (
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                            item.classification === 'Critical' ? 'bg-red-100 text-red-800' :
                            item.classification === 'Important' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.classification}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">{quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        ₱{unitCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">
                    Total Cost:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">
                    ₱{totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Additional Information */}
          {additionalInfo && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {additionalInfo.supplier && (
                  <div>
                    <span className="text-gray-600">Supplier:</span>
                    <span className="ml-2 font-medium text-gray-900">{additionalInfo.supplier}</span>
                  </div>
                )}
                {additionalInfo.contact && (
                  <div>
                    <span className="text-gray-600">Contact:</span>
                    <span className="ml-2 font-medium text-gray-900">{additionalInfo.contact}</span>
                  </div>
                )}
                {additionalInfo.email && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium text-gray-900">{additionalInfo.email}</span>
                  </div>
                )}
                {additionalInfo.paymentTerms && (
                  <div>
                    <span className="text-gray-600">Payment Terms:</span>
                    <span className="ml-2 font-medium text-gray-900">{additionalInfo.paymentTerms}</span>
                  </div>
                )}
                {additionalInfo.shippingMethod && (
                  <div>
                    <span className="text-gray-600">Shipping Method:</span>
                    <span className="ml-2 font-medium text-gray-900">{additionalInfo.shippingMethod}</span>
                  </div>
                )}
                {additionalInfo.notes && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Notes:</span>
                    <p className="mt-1 text-gray-900">{additionalInfo.notes}</p>
                  </div>
                )}
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
