'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Search, X, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { IProduct } from '@/types';

interface MatchingItemsPickerProps {
  /** IDs of currently linked matching items. */
  value: string[];
  /** ID of the product being edited (excluded from search results). */
  excludeId?: string;
  onChange: (ids: string[]) => void;
}

interface ProductsResponse {
  products: IProduct[];
}

export default function MatchingItemsPicker({
  value,
  excludeId,
  onChange,
}: MatchingItemsPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IProduct[]>([]);
  const [linked, setLinked] = useState<IProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [hydrating, setHydrating] = useState(value.length > 0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate the chips: turn the IDs we were given into full product cards.
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (value.length === 0) {
        setLinked([]);
        setHydrating(false);
        return;
      }
      setHydrating(true);
      try {
        const fetched = await Promise.all(
          value.map((id) =>
            apiGet<IProduct>(`/products/${id}`).catch(() => null)
          )
        );
        if (!cancelled) {
          setLinked(fetched.filter((p): p is IProduct => !!p));
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [value]);

  // Debounced search.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiGet<ProductsResponse>(
          `/products?search=${encodeURIComponent(query.trim())}&limit=8`
        );
        const filtered = data.products.filter(
          (p) => p._id !== excludeId && !value.includes(p._id)
        );
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, value, excludeId]);

  const add = (p: IProduct) => {
    onChange([...value, p._id]);
    setQuery('');
    setResults([]);
  };

  const remove = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Matching items <span className="text-gray-400 font-normal">(cross-sell)</span>
      </label>

      {/* Linked chips */}
      {hydrating ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading linked items…
        </div>
      ) : linked.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {linked.map((p) => (
            <div
              key={p._id}
              className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="relative w-10 h-10 bg-gray-100 rounded shrink-0 overflow-hidden">
                {p.images?.[0] && (
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {p.name}
                </p>
                <p className="text-xs text-gray-500">{formatPrice(p.price)}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(p._id)}
                className="text-gray-400 hover:text-red-600 p-1"
                aria-label={`Unlink ${p.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products to add as matching items…"
          className="input-field pl-9"
        />
      </div>

      {/* Results */}
      {query.trim() && (
        <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
          {searching ? (
            <div className="p-3 text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No matches.</div>
          ) : (
            <ul className="divide-y max-h-64 overflow-y-auto">
              {results.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={() => add(p)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 text-left"
                  >
                    <div className="relative w-10 h-10 bg-gray-100 rounded shrink-0 overflow-hidden">
                      {p.images?.[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.category}
                        {p.productType ? ` · ${p.productType}` : ''} ·{' '}
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Linked items appear as &ldquo;Pairs well with&rdquo; on Shop-by-Goal results
        and &ldquo;Complete the Look&rdquo; on the product page.
      </p>
    </div>
  );
}
