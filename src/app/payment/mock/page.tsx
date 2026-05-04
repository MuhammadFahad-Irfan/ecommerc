'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Loader from '@/components/Loader';
import { formatPrice } from '@/lib/utils';

/**
 * Mock Easypaisa Gateway Page
 *
 * This page simulates the Easypaisa payment portal for local testing.
 * In production with MOCK_PAYMENT=false, users are redirected to the
 * real Easypaisa gateway instead of this page.
 */
function MockGatewayContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const txnId = searchParams.get('txnId');
  const amount = parseFloat(searchParams.get('amount') || '0');
  const [processing, setProcessing] = useState(false);

  const handleAction = (status: 'success' | 'failed') => {
    setProcessing(true);
    // Simulate gateway processing delay then redirect to our callback
    setTimeout(() => {
      const callbackUrl = `/api/payment/easypaisa/callback?orderRefNum=${txnId}&status=${status}&amount=${amount}`;
      window.location.href = callbackUrl;
    }, 1500);
  };

  return (
    <div className="container-custom py-16 max-w-md">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        {/* Mock Easypaisa header */}
        <div className="bg-green-600 text-white p-6 text-center">
          <h1 className="text-2xl font-bold">Easypaisa</h1>
          <p className="text-sm opacity-90 mt-1">Mock Payment Gateway (Test Mode)</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
            ⚠️ This is a mock gateway for development. In production with real Easypaisa
            credentials and <code className="bg-yellow-100 px-1 rounded">MOCK_PAYMENT=false</code>,
            users see the actual Easypaisa portal.
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-xs">{txnId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-xs truncate max-w-[180px]">{orderId}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between text-base">
              <span className="font-medium">Amount:</span>
              <span className="font-bold text-green-700">{formatPrice(amount)}</span>
            </div>
          </div>

          {processing ? (
            <div className="text-center py-4">
              <Loader />
              <p className="text-sm text-gray-600 mt-2">Processing payment...</p>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleAction('success')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg py-3 transition"
              >
                ✅ Simulate Successful Payment
              </button>
              <button
                onClick={() => handleAction('failed')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg py-3 transition"
              >
                ❌ Simulate Failed Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <MockGatewayContent />
    </Suspense>
  );
}
