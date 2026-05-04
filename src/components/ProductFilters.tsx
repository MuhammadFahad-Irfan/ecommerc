'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';

const CATEGORIES = ['Child', 'Women', 'Islamic'] as const;
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];
const RATINGS = [4, 3, 2, 1];

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  // Sync filter state when URL changes (e.g. after a search)
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minRating: searchParams.get('minRating') || '',
      sort: searchParams.get('sort') || 'newest',
    });
  }, [searchParams]);

  const applyFilters = (newFilters: typeof filters) => {
    const params = new URLSearchParams();

    // Preserve existing search query
    const search = searchParams.get('search');
    if (search) params.set('search', search);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });

    router.push(`/products?${params.toString()}`);
    setShowMobileFilters(false);
  };

  const clearAll = () => {
    const cleared = {
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: 'newest',
    };
    setFilters(cleared);
    applyFilters(cleared);
  };

  const updateFilter = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    applyFilters(updated);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Sort by</h3>
        <select
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="input-field"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={filters.category === ''}
              onChange={() => updateFilter('category', '')}
              className="text-primary-600"
            />
            <span className="text-sm">All Categories</span>
          </label>
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat}
                onChange={() => updateFilter('category', cat)}
                className="text-primary-600"
              />
              <span className="text-sm">{cat === 'Islamic' ? 'Islamic Modest' : cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price (PKR)</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            onBlur={() => applyFilters(filters)}
            min="0"
            className="input-field text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            onBlur={() => applyFilters(filters)}
            min="0"
            className="input-field text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Customer Rating</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="minRating"
              checked={filters.minRating === ''}
              onChange={() => updateFilter('minRating', '')}
              className="text-primary-600"
            />
            <span className="text-sm">All Ratings</span>
          </label>
          {RATINGS.map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === r.toString()}
                onChange={() => updateFilter('minRating', r.toString())}
                className="text-primary-600"
              />
              <span className="text-sm">{r}★ & up</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={clearAll} className="btn-secondary w-full text-sm">
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile filter toggle button */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden flex items-center gap-2 btn-secondary mb-4"
      >
        <Filter className="h-4 w-4" />
        Filters
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block bg-white p-6 rounded-lg border border-gray-200 sticky top-20 h-fit">
        <FilterContent />
      </aside>

      {/* Mobile drawer */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-full bg-white p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </>
  );
}
