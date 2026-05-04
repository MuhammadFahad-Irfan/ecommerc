'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import Pagination from '@/components/Pagination';
import { ProductGridSkeleton } from '@/components/Loader';
import { apiGet } from '@/lib/api';
import type { IProduct } from '@/types';

interface ProductsResponse {
  products: IProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const fetchProducts = async () => {
      try {
        const queryString = searchParams.toString();
        const result = await apiGet<ProductsResponse>(`/products?${queryString}`);
        if (active) setData(result);
      } catch (err) {
        if (active) {
          const error = err as { message?: string };
          setError(error.message || 'Failed to load products');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build heading text based on active filters
  let heading = 'All Products';
  if (search) heading = `Search: "${search}"`;
  else if (category) heading = `${category === 'Islamic' ? 'Islamic Modest Wear' : category}`;

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{heading}</h1>
        {data && (
          <p className="text-gray-600 mt-1">{data.pagination.total} products found</p>
        )}
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <ProductFilters />

        <div>
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 mb-2">{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary">
                Retry
              </button>
            </div>
          ) : !data || data.products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border">
              <p className="text-gray-500 text-lg mb-2">No products found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {data.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={data.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}
