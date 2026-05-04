'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import Loader from '@/components/Loader';
import type { IOrder } from '@/types';

interface PageProps {
  params: { id: string };
}

const STATUS_CONFIG = {
  pending: { color: 'text-yellow-700 bg-yellow-100', icon: Clock, label: 'Pending' },
  processing: { color: 'text-blue-700 bg-blue-100', icon: Package, label: 'Processing' },
  shipped: { color: 'text-purple-700 bg-purple-100', icon: Package, label: 'Shipped' },
  delivered: { color: 'text-green-700 bg-green-100', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'text-red-700 bg-red-100', icon: XCircle, label: 'Cancelled' },
};

const PAYMENT_STATUS = {
  pending: { color: 'text-yellow-700 bg-yellow-100', label: 'Payment Pending' },
  paid: { color: 'text-green-700 bg-green-100', label: 'Paid' },
  failed: { color: 'text-red-700 bg-red-100', label: 'Payment Failed' },
  refunded: { color: 'text-gray-700 bg-gray-100', label: 'Refunded' },
};

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = params;
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await apiGet<IOrder>(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        const error = err as { message?: string };
        setError(error.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <Loader fullPage />;

  if (error || !order) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const StatusConfig = STATUS_CONFIG[order.orderStatus];
  const StatusIcon = StatusConfig.icon;
  const PaymentConfig = PAYMENT_STATUS[order.paymentStatus];

  return (
    <div className="container-custom py-8 max-w-4xl">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 flex items-start gap-3">
        <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
        <div>
          <h1 className="text-xl font-bold text-green-900">Order Placed Successfully!</h1>
          <p className="text-green-800 mt-1">Thank you for your purchase. Your order number is:</p>
          <p className="text-green-900 font-mono font-bold mt-1 text-lg">{order.orderNumber}</p>
          <p className="text-sm text-green-700 mt-2">
            Save this page — you can revisit it anytime using the URL.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${StatusConfig.color} flex items-center gap-3`}>
          <StatusIcon className="h-5 w-5" />
          <div>
            <p className="text-xs uppercase font-semibold opacity-75">Order Status</p>
            <p className="font-bold">{StatusConfig.label}</p>
          </div>
        </div>
        <div className={`p-4 rounded-lg ${PaymentConfig.color} flex items-center gap-3`}>
          <CheckCircle className="h-5 w-5" />
          <div>
            <p className="text-xs uppercase font-semibold opacity-75">Payment Status</p>
            <p className="font-bold">{PaymentConfig.label}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-bold text-gray-900 mb-3">Delivery Address</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium">{order.customerName}</p>
            <p>{order.phone}</p>
            {order.email && <p>{order.email}</p>}
            <p>{order.address}</p>
            <p>{order.city}</p>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-bold text-gray-900 mb-3">Order Information</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between"><span>Order Date:</span><span className="font-medium">{formatDate(order.createdAt)}</span></div>
            <div className="flex justify-between"><span>Payment Method:</span><span className="font-medium uppercase">{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span>Items:</span><span className="font-medium">{order.products.reduce((s, p) => s + p.quantity, 0)}</span></div>
            <div className="flex justify-between border-t pt-2 mt-2 text-base">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-primary-700">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.products.map((item, idx) => (
            <div key={idx} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
              {item.image && (
                <div className="relative w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover rounded" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-sm text-primary-700 font-semibold">{formatPrice(item.price)} each</p>
              </div>
              <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center mt-8">
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
