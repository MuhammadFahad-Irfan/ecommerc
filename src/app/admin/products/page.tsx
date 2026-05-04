'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { apiGet, apiDelete } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Loader from '@/components/Loader';
import Pagination from '@/components/Pagination';
import type { IProduct } from '@/types';

interface ProductsResponse {
  products: IProduct[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function AdminProductsPage() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      const result = await apiGet<ProductsResponse>(`/products?${params.toString()}`);
      setData(result);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      await apiDelete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600">Manage your store inventory</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => { e.preventDefault(); setPage(1); fetchProducts(); }}
        className="relative mb-4"
      >
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10 max-w-sm"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </form>

      {loading ? (
        <Loader />
      ) : !data || data.products.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No products yet.</p>
          <Link href="/admin/products/new" className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Your First Product
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Rating</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                            {product.images?.[0] ? (
                              <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover rounded" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No image</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            {product.isFeatured && (
                              <span className="text-xs text-primary-600">★ Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{product.category}</td>
                      <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          product.stock > 10 ? 'bg-green-100 text-green-700'
                          : product.stock > 0 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {product.averageRating.toFixed(1)} ({product.numReviews})
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <Link
                            href={`/admin/products/${product._id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            aria-label="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
