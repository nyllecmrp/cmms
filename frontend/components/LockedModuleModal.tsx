'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface LockedModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleCode: string;
  onRequestTrial?: () => void;
  onUpgrade?: () => void;
}

export default function LockedModuleModal({
  isOpen,
  onClose,
  moduleCode,
  onRequestTrial,
  onUpgrade,
}: LockedModuleModalProps) {
  const { user } = useAuth();
  const [moduleInfo, setModuleInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState<'trial' | 'purchase' | null>(null);
  const [justification, setJustification] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchModuleInfo = async () => {
      if (!user?.organizationId || !moduleCode) return;

      try {
        const modules = await api.getOrganizationModules(user.organizationId) as any[];
        const module = modules.find((m: any) => m.moduleCode === moduleCode);
        setModuleInfo(module);
      } catch (error) {
        console.error('Failed to fetch module info:', error);
      }
    };

    if (isOpen) {
      fetchModuleInfo();
      setSubmitted(false);
      setRequestType(null);
      setJustification('');
    }
  }, [isOpen, moduleCode, user?.organizationId]);

  const handleSubmitRequest = async () => {
    if (!user || !requestType) return;

    setLoading(true);
    try {
      await api.createModuleRequest({
        organizationId: user.organizationId,
        requestedById: user.id,
        moduleCode: moduleCode,
        requestType: requestType,
        justification: justification || `Request for ${requestType} of ${moduleInfo?.name}`,
      });

      setSubmitted(true);
    } catch (error: any) {
      alert(`Failed to submit request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {moduleInfo?.name || 'Premium Module'}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {/* Module Description */}
                <div className="mb-6">
                  <p className="text-gray-600 text-lg mb-4">
                    {moduleInfo?.description || 'This premium module is not included in your current plan.'}
                  </p>

                  {/* Tier Badge */}
                  {moduleInfo?.tier && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {moduleInfo.tier.charAt(0).toUpperCase() + moduleInfo.tier.slice(1)} Tier
                    </div>
                  )}
                </div>

                {/* Features List */}
                {moduleInfo?.features && moduleInfo.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Key Features:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {moduleInfo.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start bg-blue-50 p-3 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Type Selection */}
                {!requestType ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-3">How would you like to proceed?</h4>

                    {/* Trial Option */}
                    <button
                      onClick={() => setRequestType('trial')}
                      className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">Start 30-Day Free Trial</h5>
                          <p className="text-sm text-gray-600">
                            Test drive this module with full features for 30 days. No credit card required.
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>

                    {/* Purchase Option */}
                    <button
                      onClick={() => setRequestType('purchase')}
                      className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left group"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">Upgrade Plan & Purchase</h5>
                          <p className="text-sm text-gray-600">
                            Contact our sales team to add this module to your subscription.
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h5 className="font-semibold text-gray-900">
                          {requestType === 'trial' ? 'Trial Request' : 'Purchase Request'}
                        </h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        {requestType === 'trial'
                          ? 'Our team will activate your 30-day trial within 24 hours.'
                          : 'Our sales team will contact you within 24 hours with pricing and next steps.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments (Optional)
                      </label>
                      <textarea
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us why you need this module or any specific requirements..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setRequestType(null)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleSubmitRequest}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Success State */
            <div className="px-6 py-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
              <p className="text-gray-600 mb-6">
                {requestType === 'trial'
                  ? 'Your trial request has been received. We\'ll activate your 30-day trial within 24 hours and notify you via email.'
                  : 'Our sales team has received your request and will contact you within 24 hours with pricing details and next steps.'}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
