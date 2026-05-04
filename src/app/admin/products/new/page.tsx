'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

      <ProductForm mode="create" />
    </div>
  );
}
