'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import Loader from '@/components/Loader';
import { apiGet } from '@/lib/api';
import type { IProduct } from '@/types';

interface PageProps {
  params: { id: string };
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = params;
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await apiGet<IProduct>(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <Loader fullPage />;
  if (!product) {
    return (
      <div className="p-6 text-center">
        <p>Product not found.</p>
        <Link href="/admin/products" className="btn-primary mt-4 inline-block">Back</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

      <ProductForm mode="edit" product={product} />
    </div>
  );
}
