'use client';

import { useState, FormEvent } from 'react';
import { Package, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiGet } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import type { IOrder } from '@/types';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<IOrder | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedOrder = orderNumber.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedOrder || !trimmedPhone) return;

    setLoading(true);
    setOrder(null);
    try {
      const result = await apiGet<IOrder>(
        `/orders/lookup?orderNumber=${encodeURIComponent(
          trimmedOrder
        )}&phone=${encodeURIComponent(trimmedPhone)}`
      );
      setOrder(result);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Could not find order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex bg-primary-100 rounded-full p-3 mb-3">
          <Package className="h-6 w-6 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
        <p className="text-gray-600 mt-1">
          Enter your order number to see the latest status and details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg p-6 mb-8 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Number
          </label>
          <input
            type="text"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="ORD-XXXXXXX-XXXX"
            className="input-field w-full"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0300-1234567"
            className="input-field w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            The phone number you used at checkout.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2 w-full justify-center"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Track Order
        </button>

        <p className="text-xs text-gray-500">
          Your order number is on the order confirmation page or receipt.
        </p>
      </form>

      {order && <OrderDetails order={order} />}
    </div>
  );
}

function OrderDetails({ order }: { order: IOrder }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b">
        <div>
          <p className="text-sm text-gray-500">Order Number</p>
          <p className="font-mono font-semibold text-gray-900">
            {order.orderNumber}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge label="Order" value={order.orderStatus} />
          <StatusBadge label="Payment" value={order.paymentStatus} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
        <div className="divide-y">
          {order.products.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 text-sm"
            >
              <div>
                <p className="text-gray-900">{item.name}</p>
                <p className="text-gray-500 text-xs">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="font-medium text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-3 border-t mt-2 font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Delivery</h3>
          <p className="text-gray-700">{order.customerName}</p>
          <p className="text-gray-700">{order.address}</p>
          <p className="text-gray-700">{order.city}</p>
          <p className="text-gray-700">{order.phone}</p>
          {order.email && <p className="text-gray-700">{order.email}</p>}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Payment</h3>
          <p className="text-gray-700 capitalize">
            Method: {order.paymentMethod}
          </p>
          {order.transactionId && (
            <p className="text-gray-700">Txn: {order.transactionId}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

function StatusBadge({ label, value }: { label: string; value: string }) {
  const color = STATUS_COLORS[value] || 'bg-gray-100 text-gray-800';
  return (
    <span className="text-xs">
      <span className="text-gray-500 mr-1">{label}:</span>
      <span
        className={`inline-block px-2 py-0.5 rounded-full font-medium capitalize ${color}`}
      >
        {value}
      </span>
    </span>
  );
}
