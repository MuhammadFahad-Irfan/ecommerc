'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import Loader from '@/components/Loader';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');

  return (
    <div className="container-custom py-16 text-center max-w-lg">
      <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <XCircle className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
      <p className="text-gray-600 mb-2">
        We couldn&apos;t process your payment. Don&apos;t worry — no money has been deducted.
      </p>
      {reason && (
        <p className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded">
          Reason: {decodeURIComponent(reason)}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        {orderId && (
          <Link href={`/order/${orderId}`} className="btn-secondary">
            View Order
          </Link>
        )}
        <Link href="/cart" className="btn-primary">Try Again</Link>
      </div>
      <p className="text-sm text-gray-500 mt-6">
        Need help? Contact us at{' '}
        <a href="mailto:support@modestwear.pk" className="text-primary-600 hover:underline">
          support@modestwear.pk
        </a>
      </p>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <PaymentFailedContent />
    </Suspense>
  );
}
