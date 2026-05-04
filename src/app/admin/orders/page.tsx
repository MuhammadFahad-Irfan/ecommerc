'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { apiGet, apiPatch } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import Loader from '@/components/Loader';
import Pagination from '@/components/Pagination';
import type { IOrder, OrderStatus, PaymentStatus } from '@/types';

interface OrdersResponse {
  orders: IOrder[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function AdminOrdersPage() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      if (statusFilter) params.set('orderStatus', statusFilter);
      const result = await apiGet<OrdersResponse>(`/orders?${params.toString()}`);
      setData(result);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const updateStatus = async (id: string, orderStatus: OrderStatus) => {
    try {
      await apiPatch(`/orders/${id}`, { orderStatus });
      toast.success('Order updated');
      fetchOrders();
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to update');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-600">Manage customer orders</p>
      </div>

      <div className="mb-4 flex gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field max-w-xs"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : !data || data.orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Order #</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.phone}</p>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatPrice(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${PAYMENT_COLORS[order.paymentStatus]}`}>
                          {order.paymentStatus}
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5 uppercase">{order.paymentMethod}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateStatus(order._id, e.target.value as OrderStatus)}
                          className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.orderStatus]}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/order/${order._id}`}
                          target="_blank"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded inline-flex"
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
