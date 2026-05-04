'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CreditCard, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { apiPost } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Loader from '@/components/Loader';

interface CreatedOrder {
  _id: string;
  orderNumber: string;
  paymentMethod: 'easypaisa' | 'cod';
}

interface PaymentInitResponse {
  redirectUrl?: string;
  paymentMethod?: string;
  orderId?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isHydrated, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'easypaisa' as 'easypaisa' | 'cod',
    notes: '',
  });

  // Redirect to cart if empty (after hydration)
  useEffect(() => {
    if (isHydrated && items.length === 0) {
      router.push('/cart');
    }
  }, [isHydrated, items.length, router]);

  if (!isHydrated) return <Loader fullPage />;
  if (items.length === 0) return null;

  const shipping = totalPrice >= 3000 ? 0 : 200;
  const finalTotal = totalPrice + shipping;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.customerName || !form.phone || !form.address || !form.city) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Create order on backend (server recalculates total)
      const order = await apiPost<CreatedOrder>('/orders', {
        ...form,
        email: form.email || undefined,
        products: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      toast.success('Order created! Processing payment...');

      // Initiate payment
      const paymentResponse = await apiPost<PaymentInitResponse>('/payment/initiate', {
        orderId: order._id,
      });

      // Clear cart immediately so user can't double-submit
      clearCart();

      if (form.paymentMethod === 'cod') {
        router.push(`/order/${order._id}`);
      } else if (paymentResponse.redirectUrl) {
        // Redirect to Easypaisa (or our mock page in mock mode)
        window.location.href = paymentResponse.redirectUrl;
      } else {
        router.push(`/order/${order._id}`);
      }
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to place order');
      setSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Customer info */}
        <div className="space-y-6">
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Information</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input-field"
                  placeholder="House no., Street, Area"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input-field"
                  placeholder="Karachi"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field"
                  placeholder="Any special instructions?"
                />
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                form.paymentMethod === 'easypaisa' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'easypaisa'}
                  onChange={() => setForm({ ...form, paymentMethod: 'easypaisa' })}
                  className="mt-1"
                />
                <CreditCard className="h-5 w-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Easypaisa</p>
                  <p className="text-sm text-gray-600">Pay securely via Easypaisa mobile account or card</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                form.paymentMethod === 'cod' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'cod'}
                  onChange={() => setForm({ ...form, paymentMethod: 'cod' })}
                  className="mt-1"
                />
                <Truck className="h-5 w-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay in cash when your order arrives</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit lg:sticky lg:top-20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Order</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="relative w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover rounded" />
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-600">{formatPrice(item.price)} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Total</span>
              <span className="text-primary-700">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full mt-6 inline-flex items-center justify-center gap-2"
          >
            {submitting ? 'Processing...' : `Place Order — ${formatPrice(finalTotal)}`}
          </button>

          <Link href="/cart" className="text-center block mt-3 text-sm text-gray-600 hover:text-primary-600">
            Back to Cart
          </Link>
        </div>
      </form>
    </div>
  );
}
