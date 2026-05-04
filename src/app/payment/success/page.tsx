'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Loader from '@/components/Loader';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  // Auto-redirect to order detail page after 3 seconds
  useEffect(() => {
    if (orderId) {
      const timer = setTimeout(() => {
        router.push(`/order/${orderId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderId, router]);

  return (
    <div className="container-custom py-16 text-center max-w-lg">
      <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. Your payment has been processed successfully and your order is being prepared.
      </p>
      {orderId ? (
        <>
          <p className="text-sm text-gray-500 mb-4">Redirecting to your order details...</p>
          <Link href={`/order/${orderId}`} className="btn-primary">
            View Order Details
          </Link>
        </>
      ) : (
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
